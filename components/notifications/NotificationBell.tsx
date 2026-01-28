
import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageSquare, Shield, Check } from 'lucide-react';
import { communityService } from '../../services/communityService';
import { Notification } from '../../types';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); 
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await communityService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    await communityService.markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await communityService.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShow(!show)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#000000]">
            {unreadCount}
          </span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-6 w-80 glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-[100] animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Notifications</h3>
            <button 
              onClick={handleMarkAllRead}
              className="text-[9px] font-black text-[#10B981] uppercase tracking-widest hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[9px] text-gray-600 font-black uppercase tracking-widest">
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`p-4 border-b border-white/5 last:border-0 cursor-pointer transition-all flex items-start gap-4 ${n.is_read ? 'opacity-50' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <div className={`p-2 rounded-lg ${n.type === 'like' ? 'bg-red-500/10 text-red-500' : n.type === 'comment' ? 'bg-[#2DD4BF]/10 text-[#2DD4BF]' : 'bg-[#10B981]/10 text-[#10B981]'}`}>
                    {n.type === 'like' ? <Heart className="w-3 h-3 fill-current" /> : n.type === 'comment' ? <MessageSquare className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-white font-medium">{typeof n.message === 'string' ? n.message : JSON.stringify(n.message)}</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{new Date(n.created_at).toLocaleTimeString()}</p>
                  </div>
                  {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-2" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
