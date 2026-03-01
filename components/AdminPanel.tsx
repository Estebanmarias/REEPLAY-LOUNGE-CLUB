import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Menu, Calendar, ShoppingBag, Image, Save, ToggleLeft, ToggleRight, Loader2, CheckCircle, Trash2, Plus, X } from 'lucide-react';

const ADMIN_PASSWORD = 'reeplay2026';

type AdminView = 'menu' | 'events' | 'orders' | 'gallery';

interface MenuItemRow {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_sold_out: boolean;
}

interface EventRow {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  image_url: string;
  description: string;
  price: string;
  is_active: boolean;
}

interface OrderRow {
  id: string;
  visual_id: string;
  customer_name: string;
  customer_phone: string;
  type: string;
  total: number;
  status: string;
  details: string;
  items: any[];
  created_at: string;
  special_requests?: string;
}

const CATEGORIES = ['rice', 'pasta', 'sides', 'cocktails', 'bottles', 'beverages'];
const STATUSES = ['Pending', 'Confirmed', 'Out for Delivery', 'Completed'];

const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeView, setActiveView] = useState<AdminView>('orders');
  const [toast, setToast] = useState<string | null>(null);

  // Menu state
  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('rice');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<EventRow>>({ is_active: true });
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Gallery state
  const [gallery, setGallery] = useState<{ id: string; image_url: string; caption: string }[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password.');
    }
  };

  // --- MENU ---
  const fetchMenu = async () => {
    setMenuLoading(true);
    const { data } = await supabase.from('menu_items').select('*').order('name');
    if (data) setMenuItems(data);
    setMenuLoading(false);
  };

  const updateMenuItem = async (item: MenuItemRow) => {
    setSavingId(item.id);
    const { error } = await supabase.from('menu_items').update({
      price: item.price,
      is_sold_out: item.is_sold_out,
      description: item.description,
    }).eq('id', item.id);
    if (!error) showToast('Saved!');
    setSavingId(null);
  };

  const handleMenuChange = (id: string, field: keyof MenuItemRow, value: any) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // --- EVENTS ---
  const fetchEvents = async () => {
    setEventsLoading(true);
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
    setEventsLoading(false);
  };

  const saveNewEvent = async () => {
    if (!newEvent.title) return;
    const { error } = await supabase.from('events').insert(newEvent);
    if (!error) {
      showToast('Event added!');
      setNewEvent({ is_active: true });
      setShowNewEventForm(false);
      fetchEvents();
    }
  };

  const toggleEventActive = async (id: string, current: boolean) => {
    await supabase.from('events').update({ is_active: !current }).eq('id', id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, is_active: !current } : e));
    showToast('Updated!');
  };

  const deleteEvent = async (id: string) => {
    await supabase.from('events').delete().eq('id', id);
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Deleted!');
  };

  // --- ORDERS ---
  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setOrders(data);
    setOrdersLoading(false);
  };

 const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      showToast('Error: ' + error.message);
      return;
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast('Status updated!');
  };

  // --- GALLERY ---
  const fetchGallery = async () => {
    setGalleryLoading(true);
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setGallery(data);
    setGalleryLoading(false);
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('gallery').upload(fileName, file);
    if (error) {
      showToast('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
    await supabase.from('gallery').insert({ image_url: urlData.publicUrl, caption: file.name });
    showToast('Image uploaded!');
    fetchGallery();
    setUploading(false);
  };

  const deleteGalleryImage = async (id: string, imageUrl: string) => {
    const fileName = imageUrl.split('/').pop();
    if (fileName) await supabase.storage.from('gallery').remove([fileName]);
    await supabase.from('gallery').delete().eq('id', id);
    setGallery(prev => prev.filter(g => g.id !== id));
    showToast('Deleted!');
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeView === 'menu') fetchMenu();
    if (activeView === 'events') fetchEvents();
    if (activeView === 'orders') fetchOrders();
    if (activeView === 'gallery') fetchGallery();
  }, [activeView, isLoggedIn]);

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#18181b] border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-2">Admin Panel</h1>
          <p className="text-gray-500 text-sm mb-6">Reeplay Lounge & Club</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-purple-500 mb-3"
          />
          {passwordError && <p className="text-red-400 text-xs mb-3">{passwordError}</p>}
          <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl">
            Login
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN UI ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#18181b] border-b border-white/10 p-4 flex justify-between items-center">
        <h1 className="font-black text-lg">Reeplay Admin</h1>
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Nav */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {[
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'menu', label: 'Menu', icon: Menu },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'gallery', label: 'Gallery', icon: Image },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as AdminView)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all
              ${activeView === tab.id ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-4xl mx-auto">

        {/* --- ORDERS --- */}
        {activeView === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Incoming Orders</h2>
              <button onClick={fetchOrders} className="text-xs text-purple-400 hover:text-purple-300">Refresh</button>
            </div>
            {ordersLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
              orders.length === 0 ? <p className="text-gray-500 text-center mt-8">No orders yet.</p> : (
                orders.map(order => (
                  <div key={order.id} className="bg-[#18181b] border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-purple-400 text-sm">{order.visual_id}</span>
                        <p className="font-bold text-white">{order.customer_name}</p>
                        <p className="text-gray-400 text-xs">{order.customer_phone} • {order.type.toUpperCase()}</p>
                        <p className="text-gray-400 text-xs">{order.details}</p>
                        {order.special_requests && <p className="text-yellow-400 text-xs mt-1">📝 {order.special_requests}</p>}
                      </div>
                      <span className="text-yellow-500 font-mono font-bold">₦{order.total?.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/5 pt-2 text-xs text-gray-400">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i}>{item.quantity}x {item.name}</div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          onClick={() => updateOrderStatus(order.id, s)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all
                          ${order.status?.toLowerCase() === s.toLowerCase() ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}

        {/* --- MENU --- */}
        {activeView === 'menu' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Menu Manager</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap capitalize transition-all
                    ${activeCategory === cat ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {menuLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
              menuItems.filter(i => i.category_id === activeCategory).map(item => (
                <div key={item.id} className="bg-[#18181b] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-white">{item.name}</p>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleMenuChange(item.id, 'description', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-gray-300 mt-1 outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      onClick={() => handleMenuChange(item.id, 'is_sold_out', !item.is_sold_out)}
                      className="shrink-0"
                    >
                      {item.is_sold_out
                        ? <ToggleRight className="w-8 h-8 text-red-500" />
                        : <ToggleLeft className="w-8 h-8 text-gray-500" />
                      }
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">₦</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={e => handleMenuChange(item.id, 'price', parseInt(e.target.value))}
                      className="w-32 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-yellow-400 font-mono outline-none focus:border-purple-500"
                    />
                    {item.is_sold_out && <span className="text-xs text-red-400 font-bold">SOLD OUT</span>}
                    <button
                      onClick={() => updateMenuItem(item)}
                      className="ml-auto flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold"
                    >
                      {savingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- EVENTS --- */}
        {activeView === 'events' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Events Manager</h2>
              <button
                onClick={() => setShowNewEventForm(!showNewEventForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold"
              >
                <Plus className="w-3 h-3" /> Add Event
              </button>
            </div>

            {showNewEventForm && (
              <div className="bg-[#18181b] border border-purple-500/30 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-purple-400">New Event</h3>
                {[
                  { key: 'title', placeholder: 'Event Title *' },
                  { key: 'date', placeholder: 'Date (e.g. This Friday)' },
                  { key: 'time', placeholder: 'Time (e.g. 10:00 PM)' },
                  { key: 'category', placeholder: 'Category (e.g. Themed Party)' },
                  { key: 'image_url', placeholder: 'Image URL' },
                  { key: 'price', placeholder: 'Price (e.g. Free Entry / ₦5,000)' },
                ].map(field => (
                  <input
                    key={field.key}
                    placeholder={field.placeholder}
                    value={(newEvent as any)[field.key] || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                ))}
                <textarea
                  placeholder="Description"
                  value={newEvent.description || ''}
                  onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-500 resize-none h-20"
                />
                <div className="flex gap-3">
                  <button onClick={saveNewEvent} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold">Save Event</button>
                  <button onClick={() => setShowNewEventForm(false)} className="px-4 py-2 bg-white/5 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            )}

            {eventsLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
              events.length === 0 ? <p className="text-gray-500 text-center mt-8">No events yet.</p> : (
                events.map(event => (
                  <div key={event.id} className="bg-[#18181b] border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{event.title}</p>
                        <p className="text-gray-400 text-xs">{event.date} • {event.time} • {event.price}</p>
                        <p className="text-gray-500 text-xs mt-1">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleEventActive(event.id, event.is_active)}>
                          {event.is_active
                            ? <ToggleRight className="w-7 h-7 text-green-500" />
                            : <ToggleLeft className="w-7 h-7 text-gray-500" />
                          }
                        </button>
                        <button onClick={() => deleteEvent(event.id)} className="p-1 hover:text-red-400 text-gray-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}

        {/* --- GALLERY --- */}
        {activeView === 'gallery' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Gallery Manager</h2>
              <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold cursor-pointer">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Upload Image
                <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
              </label>
            </div>
            {galleryLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gallery.map(img => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square">
                    <img src={img.image_url} alt={img.caption} className="w-full h-full object-cover" />
                    <button
                      onClick={() => deleteGalleryImage(img.id, img.image_url)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;