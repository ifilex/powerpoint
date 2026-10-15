import { CollaborationUser, SlideComment, Presentation } from '../types/presentation';

export interface CollabMessage {
  type: 'presence' | 'cursor' | 'slide_change' | 'element_select' | 'comment_add' | 'comment_resolve' | 'presentation_sync';
  userId: string;
  payload: any;
  timestamp: number;
}

const COLLAB_CHANNEL_NAME = 'powerpoint_realtime_collaboration';

export const SIMULATED_TEAM_MEMBERS: CollaborationUser[] = [
  {
    id: 'user-valeria',
    name: 'Valeria Gómez',
    color: '#EC4899',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    currentSlideId: 'slide-1',
    cursor: { x: 420, y: 190 },
    selectedElementId: 'el-title',
    lastActive: Date.now(),
  },
  {
    id: 'user-mateo',
    name: 'Mateo Fernández',
    color: '#3B82F6',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    currentSlideId: 'slide-2',
    cursor: { x: 580, y: 260 },
    selectedElementId: null,
    lastActive: Date.now(),
  },
  {
    id: 'user-lucia',
    name: 'Lucía Morales (Diseño)',
    color: '#10B981',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    currentSlideId: 'slide-3',
    cursor: { x: 210, y: 310 },
    selectedElementId: null,
    lastActive: Date.now(),
  },
];

export class CollaborationService {
  private channel: BroadcastChannel | null = null;
  private currentUser: CollaborationUser;
  private activeUsers: Map<string, CollaborationUser> = new Map();
  private listeners: ((users: CollaborationUser[]) => void)[] = [];
  private commentListeners: ((comments: SlideComment[]) => void)[] = [];
  private syncListeners: ((presentation: Presentation) => void)[] = [];

  constructor(
    roomOrName?: string | any,
    userOrColor?: any,
    onUsersChange?: (users: CollaborationUser[]) => void,
    onSync?: (pres: Presentation) => void
  ) {
    let name = 'Tú (Autor)';
    let color = '#EA580C';
    let avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60';
    let id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (typeof userOrColor === 'object' && userOrColor !== null) {
      name = userOrColor.name || name;
      color = userOrColor.color || color;
      avatar = userOrColor.avatar || avatar;
      if (userOrColor.id) id = userOrColor.id;
    } else if (typeof roomOrName === 'string' && typeof userOrColor === 'string') {
      name = roomOrName;
      color = userOrColor;
    }

    this.currentUser = {
      id,
      name,
      color,
      avatar,
      currentSlideId: 'slide-1',
      cursor: null,
      selectedElementId: null,
      lastActive: Date.now(),
      isHost: true,
    };

    if (onUsersChange) {
      this.subscribeUsers(onUsersChange);
    }
    if (onSync) {
      this.subscribeSync(onSync);
    }

    // Initialize only the current user session (no simulated members)
    this.activeUsers.set(this.currentUser.id, this.currentUser);

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(COLLAB_CHANNEL_NAME);
        this.channel.onmessage = (event) => this.handleIncomingMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel not available in this frame:', e);
      }
    }

    // Periodically broadcast heartbeat presence
    setInterval(() => {
      this.broadcastPresence();
    }, 4000);
  }

  getCurrentUser(): CollaborationUser {
    return this.currentUser;
  }

  getActiveUsers(): CollaborationUser[] {
    return Array.from(this.activeUsers.values());
  }

  subscribeUsers(callback: (users: CollaborationUser[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getActiveUsers());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  subscribeComments(callback: (comments: SlideComment[]) => void): () => void {
    this.commentListeners.push(callback);
    return () => {
      this.commentListeners = this.commentListeners.filter((l) => l !== callback);
    };
  }

  subscribeSync(callback: (presentation: Presentation) => void): () => void {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== callback);
    };
  }

  broadcastCursor(x: number, y: number, currentSlideId: string) {
    this.updateCursor(x, y, currentSlideId);
  }

  broadcastPresentation(presentation: Presentation) {
    this.broadcastPresentationChange(presentation);
  }

  disconnect() {
    try {
      this.channel?.close();
      this.channel = null;
    } catch (e) {
      // ignore
    }
  }

  updateCursor(x: number, y: number, currentSlideId: string) {
    this.currentUser.cursor = { x, y };
    this.currentUser.currentSlideId = currentSlideId;
    this.currentUser.lastActive = Date.now();
    this.activeUsers.set(this.currentUser.id, this.currentUser);

    this.postMessage({
      type: 'cursor',
      userId: this.currentUser.id,
      payload: { cursor: { x, y }, currentSlideId },
      timestamp: Date.now(),
    });
    this.notifyUsers();
  }

  updateSlide(slideId: string) {
    this.currentUser.currentSlideId = slideId;
    this.currentUser.lastActive = Date.now();
    this.activeUsers.set(this.currentUser.id, this.currentUser);

    this.postMessage({
      type: 'slide_change',
      userId: this.currentUser.id,
      payload: { slideId },
      timestamp: Date.now(),
    });
    this.notifyUsers();
  }

  selectElement(elementId: string | null) {
    this.currentUser.selectedElementId = elementId;
    this.activeUsers.set(this.currentUser.id, this.currentUser);
    this.postMessage({
      type: 'element_select',
      userId: this.currentUser.id,
      payload: { elementId },
      timestamp: Date.now(),
    });
    this.notifyUsers();
  }

  broadcastPresentationChange(presentation: Presentation) {
    this.postMessage({
      type: 'presentation_sync',
      userId: this.currentUser.id,
      payload: presentation,
      timestamp: Date.now(),
    });
  }

  private broadcastPresence() {
    this.currentUser.lastActive = Date.now();
    this.postMessage({
      type: 'presence',
      userId: this.currentUser.id,
      payload: this.currentUser,
      timestamp: Date.now(),
    });
  }

  private handleIncomingMessage(msg: CollabMessage) {
    if (!msg || msg.userId === this.currentUser.id) return;

    if (msg.type === 'presence' || msg.type === 'cursor' || msg.type === 'slide_change' || msg.type === 'element_select') {
      const existing = this.activeUsers.get(msg.userId) || {
        id: msg.userId,
        name: 'Colega de Equipo',
        color: '#6366F1',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
        currentSlideId: 'slide-1',
        cursor: null,
        selectedElementId: null,
        lastActive: Date.now(),
      };

      if (msg.type === 'cursor') {
        existing.cursor = msg.payload.cursor;
        existing.currentSlideId = msg.payload.currentSlideId;
      } else if (msg.type === 'slide_change') {
        existing.currentSlideId = msg.payload.slideId;
      } else if (msg.type === 'element_select') {
        existing.selectedElementId = msg.payload.elementId;
      } else if (msg.type === 'presence') {
        Object.assign(existing, msg.payload);
      }

      existing.lastActive = Date.now();
      this.activeUsers.set(msg.userId, existing);
      this.notifyUsers();
    } else if (msg.type === 'presentation_sync') {
      this.syncListeners.forEach((l) => l(msg.payload));
    }
  }

  private postMessage(msg: CollabMessage) {
    try {
      this.channel?.postMessage(msg);
    } catch (e) {
      // Ignore broadcast errors
    }
  }

  private notifyUsers() {
    const list = this.getActiveUsers();
    this.listeners.forEach((l) => l(list));
  }
}
