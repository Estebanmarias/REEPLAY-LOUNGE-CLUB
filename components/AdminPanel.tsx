import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Menu, Calendar, ShoppingBag, Image, Save, ToggleLeft, ToggleRight, Loader2, CheckCircle, Trash2, Plus, X, BarChart2, Package, Minus, MessageCircle, ClipboardList, Download } from 'lucide-react';

const ADMIN_PASSWORD = 'reeplay2026';

type AdminView = 'menu' | 'events' | 'orders' | 'gallery' | 'analytics' | 'inventory' | 'physicallog';

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
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [newOrderCount, setNewOrderCount] = useState(0);

  // Gallery state
  const [gallery, setGallery] = useState<{ id: string; image_url: string; caption: string }[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [reportRange, setReportRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showReportOptions, setShowReportOptions] = useState(false);

  // Inventory state
  const [inventory, setInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState(0);

  // Physical Sales Log state
  const [physicalLogs, setPhysicalLogs] = useState<any[]>([]);
  const [physicalLogsLoading, setPhysicalLogsLoading] = useState(false);
  const [logItem, setLogItem] = useState('');
  const [logQty, setLogQty] = useState(1);
  const [logPrice, setLogPrice] = useState(0);
  const [loggedBy, setLoggedBy] = useState('Manager');
  const [logNotes, setLogNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

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
  const fetchOrders = async (isPolling = false) => {
    setOrdersLoading(!isPolling);
    const { data } = await supabase.from('orders').select('*').eq('payment_status', 'paid').order('created_at', { ascending: false }).limit(50);
    if (data) {
      if (isPolling) {
        setOrders(prev => {
          const newOrders = data.filter((d: OrderRow) => !prev.find(p => p.id === d.id));
          if (newOrders.length > 0) {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.4);
            setNewOrderCount(prev => prev + newOrders.length);
          }
          return data;
        });
      } else {
        setOrders(data);
      }
    }
    setOrdersLoading(false);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id).select();
    if (error) { showToast('Error: ' + error.message); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast('Status updated!');
  };

  // --- INVENTORY ---
  const fetchInventory = async () => {
    setInventoryLoading(true);
    const { data } = await supabase.from('inventory').select('*').order('item_name');
    if (data) setInventory(data);
    setInventoryLoading(false);
  };

  const addInventoryItem = async () => {
    if (!newItemName || newItemStock < 0) return;
    const { error } = await supabase.from('inventory').insert({
      item_name: newItemName,
      stock_count: newItemStock,
      track_inventory: true,
    });
    if (!error) {
      showToast('Item added!');
      setNewItemName('');
      setNewItemStock(0);
      fetchInventory();
    }
  };

  const updateStock = async (id: string, stock_count: number) => {
    await supabase.from('inventory').update({ stock_count }).eq('id', id);
    setInventory(prev => prev.map(i => i.id === id ? { ...i, stock_count } : i));
  };

  const toggleTrack = async (id: string, current: boolean) => {
    await supabase.from('inventory').update({ track_inventory: !current }).eq('id', id);
    setInventory(prev => prev.map(i => i.id === id ? { ...i, track_inventory: !current } : i));
  };

  const deleteInventoryItem = async (id: string) => {
    await supabase.from('inventory').delete().eq('id', id);
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast('Deleted!');
  };

  // --- PHYSICAL SALES LOG ---
  const fetchPhysicalLogs = async () => {
    setPhysicalLogsLoading(true);
    const { data } = await supabase
      .from('physical_sales')
      .select('*')
      .order('sale_date', { ascending: false })
      .limit(50);
    if (data) setPhysicalLogs(data);
    setPhysicalLogsLoading(false);
  };

  const addPhysicalLog = async () => {
    if (!logItem || logQty <= 0) return;
    const { error } = await supabase.from('physical_sales').insert({
      item_name: logItem,
      quantity_sold: logQty,
      unit_price: logPrice,
      logged_by: loggedBy,
      sale_date: logDate,
      notes: logNotes || null,
    });
    if (!error) {
      // Deduct from inventory if item is tracked
      const invItem = inventory.find(i => i.item_name.toLowerCase() === logItem.toLowerCase());
      if (invItem) {
        const newStock = Math.max(0, invItem.stock_count - logQty);
        await supabase.from('inventory').update({ stock_count: newStock }).eq('id', invItem.id);
        if (newStock === 0) {
          await supabase.from('menu_items').update({ is_sold_out: true }).ilike('name', invItem.item_name);
        }
        fetchInventory();
      }
      showToast('Sales log added!');
      setLogItem('');
      setLogQty(1);
      setLogPrice(0);
      setLogNotes('');
      fetchPhysicalLogs();
    }
  };

  const deletePhysicalLog = async (id: string) => {
    await supabase.from('physical_sales').delete().eq('id', id);
    setPhysicalLogs(prev => prev.filter(l => l.id !== id));
    showToast('Deleted!');
  };

 const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(now.getDate() - 14);

    // Online orders
    const { data: thisWeek } = await supabase.from('orders').select('*').eq('payment_status', 'paid').gte('created_at', startOfWeek.toISOString());
    const { data: lastWeek } = await supabase.from('orders').select('*').eq('payment_status', 'paid').gte('created_at', startOfLastWeek.toISOString()).lt('created_at', startOfWeek.toISOString());

    // Physical sales
    const { data: thisWeekPhysical } = await supabase.from('physical_sales').select('*').gte('sale_date', startOfWeek.toISOString().split('T')[0]);
    const { data: lastWeekPhysical } = await supabase.from('physical_sales').select('*').gte('sale_date', startOfLastWeek.toISOString().split('T')[0]).lt('sale_date', startOfWeek.toISOString().split('T')[0]);

    if (!thisWeek) { setAnalyticsLoading(false); return; }

    // Online revenue
    const onlineRevenue = thisWeek.reduce((t: number, o: any) => t + (o.total || 0), 0);
    const lastOnlineRevenue = (lastWeek || []).reduce((t: number, o: any) => t + (o.total || 0), 0);

    // Physical revenue
    const physicalRevenue = (thisWeekPhysical || []).reduce((t: number, o: any) => t + (Number(o.total_amount) || 0), 0);
    const lastPhysicalRevenue = (lastWeekPhysical || []).reduce((t: number, o: any) => t + (Number(o.total_amount) || 0), 0);

    // Combined
    const combinedRevenue = onlineRevenue + physicalRevenue;
    const lastCombinedRevenue = lastOnlineRevenue + lastPhysicalRevenue;
    const revenueChange = lastCombinedRevenue === 0 ? 100 : Math.round(((combinedRevenue - lastCombinedRevenue) / lastCombinedRevenue) * 100);

    const onlineCount = thisWeek.length;
    const physicalCount = (thisWeekPhysical || []).length;
    const lastCount = (lastWeek || []).length;
    const countChange = lastCount === 0 ? 100 : Math.round(((onlineCount - lastCount) / lastCount) * 100);

    const avgOrder = (onlineCount + physicalCount) === 0 ? 0 : Math.round(combinedRevenue / (onlineCount + physicalCount));
    const pickupCount = thisWeek.filter((o: any) => o.type === 'pickup').length;
    const deliveryCount = thisWeek.filter((o: any) => o.type === 'delivery').length;

    // Top items (online)
    const itemMap: Record<string, number> = {};
    thisWeek.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const name = item.name?.split(' (')[0];
        if (!name) return;
        const skipKeywords = ['plastic container', 'paper bag', 'delivery fee', 'vat', 'packaging', 'tax', 'service'];
        if (skipKeywords.some(k => name.toLowerCase().includes(k))) return;
        itemMap[name] = (itemMap[name] || 0) + item.quantity;
      });
    });
    // Top items (physical)
    (thisWeekPhysical || []).forEach((log: any) => {
      if (!log.item_name) return;
      itemMap[log.item_name] = (itemMap[log.item_name] || 0) + log.quantity_sold;
    });
    const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Daily revenue — online + physical combined per day
    const dailyRevenue: { day: string; online: number; physical: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStr = day.toLocaleDateString('en-US', { weekday: 'short' });
      const dayDateStr = day.toISOString().split('T')[0];
      const dayOnline = thisWeek.filter((o: any) => new Date(o.created_at).toDateString() === day.toDateString()).reduce((t: number, o: any) => t + (o.total || 0), 0);
      const dayPhysical = (thisWeekPhysical || []).filter((o: any) => o.sale_date === dayDateStr).reduce((t: number, o: any) => t + (Number(o.total_amount) || 0), 0);
      dailyRevenue.push({ day: dayStr, online: dayOnline, physical: dayPhysical });
    }

    setAnalytics({ onlineRevenue, physicalRevenue, combinedRevenue, revenueChange, onlineCount, physicalCount, countChange, avgOrder, pickupCount, deliveryCount, topItems, dailyRevenue });
    setAnalyticsLoading(false);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const buildReportData = async (
  range: 'today' | 'week' | 'month' | 'custom',
  customStartDate?: Date,
  customEndDate?: Date
) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  if (range === 'today') { start.setHours(0, 0, 0, 0); end = now; }
  else if (range === 'week') { start.setDate(now.getDate() - 7); end = now; }
  else if (range === 'month') { start.setDate(now.getDate() - 30); end = now; }
  else if (range === 'custom' && customStartDate && customEndDate) {
    start = customStartDate; end = customEndDate; end.setHours(23, 59, 59, 999);
  }

  const startStr = start.toISOString();
  const endStr = end.toISOString();
  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  const [{ data: onlineOrders }, { data: physicalSales }, { data: inventoryData }] = await Promise.all([
    supabase.from('orders').select('*').eq('payment_status', 'paid').gte('created_at', startStr).lte('created_at', endStr).order('created_at', { ascending: false }),
    supabase.from('physical_sales').select('*').gte('sale_date', startDate).lte('sale_date', endDate).order('sale_date', { ascending: false }),
    supabase.from('inventory').select('*').order('item_name'),
  ]);

  const orders = onlineOrders || [];
  const physical = physicalSales || [];
  const inv = inventoryData || [];

  const onlineRevenue = orders.reduce((t: number, o: any) => t + (o.total || 0), 0);
  const physicalRevenue = physical.reduce((t: number, o: any) => t + (Number(o.total_amount) || 0), 0);
  const combinedRevenue = onlineRevenue + physicalRevenue;

  const skip = ['plastic container', 'paper bag', 'delivery fee', 'vat', 'packaging', 'tax', 'service'];
  const itemMap: Record<string, number> = {};
  orders.forEach((o: any) => {
    (o.items || []).forEach((item: any) => {
      const name = item.name?.split(' (')[0];
      if (!name || skip.some(k => name.toLowerCase().includes(k))) return;
      itemMap[name] = (itemMap[name] || 0) + item.quantity;
    });
  });
  physical.forEach((log: any) => {
    if (!log.item_name) return;
    itemMap[log.item_name] = (itemMap[log.item_name] || 0) + log.quantity_sold;
  });
  const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const days = range === 'today' ? 1 : range === 'week' ? 7 : range === 'month' ? 30
    : Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  const daily: { date: string; online: number; physical: number; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end); d.setDate(end.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayOnline = orders.filter((o: any) => o.created_at?.startsWith(ds)).reduce((t: number, o: any) => t + (o.total || 0), 0);
    const dayPhysical = physical.filter((o: any) => o.sale_date === ds).reduce((t: number, o: any) => t + (Number(o.total_amount) || 0), 0);
    daily.push({ date: ds, online: dayOnline, physical: dayPhysical, total: dayOnline + dayPhysical });
  }

  const rangeLabel = range === 'today' ? 'Today' : range === 'week' ? 'Last 7 Days'
    : range === 'month' ? 'Last 30 Days' : `${startDate} to ${endDate}`;

  return { orders, physical, inv, onlineRevenue, physicalRevenue, combinedRevenue, topItems, daily, rangeLabel, startDate, endDate };
};

  const downloadCSV = async (range: 'today' | 'week' | 'month' | 'custom', customStartDate?: Date, customEndDate?: Date) => {
  showToast('Generating CSV...');
  const d = await buildReportData(range, customStartDate, customEndDate);
  const ts = new Date().toISOString().split('T')[0];

  const toCSV = (rows: any[][]) =>
    rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

  const orderRows = [
    ['Order ID', 'Customer', 'Phone', 'Type', 'Status', 'Total (₦)', 'Items', 'Date'],
    ...d.orders.map((o: any) => [
      o.visual_id || o.id, o.customer_name, o.customer_phone, o.type, o.status, o.total,
      (o.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(' | '),
      new Date(o.created_at).toLocaleString('en-NG'),
    ]),
    [], ['ONLINE REVENUE', `₦${d.onlineRevenue.toLocaleString()}`],
  ];

  const physRows = [
    ['Item', 'Qty Sold', 'Unit Price (₦)', 'Total (₦)', 'Date', 'Logged By', 'Notes'],
    ...d.physical.map((p: any) => [
      p.item_name, p.quantity_sold, p.unit_price, p.total_amount, p.sale_date, p.logged_by, p.notes || '',
    ]),
    [], ['PHYSICAL REVENUE', `₦${d.physicalRevenue.toLocaleString()}`],
  ];

  const topRows = [
    ['Rank', 'Item', 'Total Units Sold'],
    ...d.topItems.map(([name, qty]: [string, number], i: number) => [i + 1, name, qty]),
  ];

  const dailyRows = [
    ['Date', 'Online (₦)', 'Physical (₦)', 'Combined (₦)'],
    ...d.daily.map(row => [row.date, row.online, row.physical, row.total]),
    [], ['COMBINED TOTAL', '', '', `₦${d.combinedRevenue.toLocaleString()}`],
  ];

  const invRows = [
    ['Item', 'Stock Count', 'Tracking', 'Status'],
    ...d.inv.map((i: any) => [
      i.item_name, i.stock_count, i.track_inventory ? 'Yes' : 'No',
      i.stock_count === 0 ? 'OUT OF STOCK' : i.stock_count <= 3 ? 'LOW STOCK' : 'OK',
    ]),
  ];

  const combined = [
    `REEPLAY LOUNGE & CLUB — REPORT (${d.rangeLabel})`,
    `Generated: ${new Date().toLocaleString('en-NG')}`,
    '', '=== ONLINE ORDERS ===', toCSV(orderRows),
    '', '=== PHYSICAL SALES ===', toCSV(physRows),
    '', '=== TOP ITEMS (COMBINED) ===', toCSV(topRows),
    '', '=== DAILY REVENUE BREAKDOWN ===', toCSV(dailyRows),
    '', '=== INVENTORY SNAPSHOT ===', toCSV(invRows),
  ].join('\n');

  downloadFile(combined, `reeplay-report-${d.rangeLabel.replace(/\s+/g, '-').toLowerCase()}-${ts}.csv`, 'text/csv;charset=utf-8;');
  showToast('CSV downloaded!');
};

const downloadPDF = async (range: 'today' | 'week' | 'month' | 'custom', customStartDate?: Date, customEndDate?: Date) => {
  showToast('Generating PDF...');
  const d = await buildReportData(range, customStartDate, customEndDate);

  const row = (cells: string[], header = false) =>
    `<tr>${cells.map(c => `<${header ? 'th' : 'td'}>${c}</${header ? 'th' : 'td'}>`).join('')}</tr>`;

  const table = (headers: string[], rows: string[][]) => `
    <table>
      <thead>${row(headers, true)}</thead>
      <tbody>${rows.map(r => row(r)).join('')}</tbody>
    </table>`;

  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8" />
  <title>Reeplay Report — ${d.rangeLabel}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#111; background:#fff; padding:32px; font-size:13px; }
    h1 { font-size:22px; font-weight:900; color:#7c3aed; margin-bottom:2px; }
    .sub { color:#666; font-size:11px; margin-bottom:24px; }
    h2 { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#7c3aed; margin:24px 0 8px; border-bottom:2px solid #7c3aed22; padding-bottom:4px; }
    table { width:100%; border-collapse:collapse; margin-bottom:8px; }
    th { background:#7c3aed; color:#fff; text-align:left; padding:6px 8px; font-size:11px; }
    td { padding:5px 8px; border-bottom:1px solid #eee; font-size:12px; }
    tr:last-child td { border-bottom:none; }
    tr:nth-child(even) td { background:#f9f9f9; }
    .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:8px; }
    .card { border:1px solid #e5e7eb; border-radius:8px; padding:12px 16px; }
    .card-label { font-size:10px; color:#888; text-transform:uppercase; letter-spacing:0.06em; }
    .card-value { font-size:18px; font-weight:900; color:#7c3aed; margin-top:2px; }
    .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; }
    .ok { background:#dcfce7; color:#166534; }
    .low { background:#fef9c3; color:#854d0e; }
    .out { background:#fee2e2; color:#991b1b; }
    footer { margin-top:32px; text-align:center; font-size:10px; color:#aaa; }
    @media print { body { padding:16px; } }
  </style>
</head>
<body>
  <h1>Reeplay Lounge &amp; Club</h1>
  <p class="sub">Report Period: ${d.rangeLabel} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-NG')}</p>

  <h2>Summary</h2>
  <div class="summary">
    <div class="card"><div class="card-label">Online Revenue</div><div class="card-value">₦${d.onlineRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="card-label">Physical Revenue</div><div class="card-value">₦${d.physicalRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="card-label">Combined Total</div><div class="card-value">₦${d.combinedRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="card-label">Online Orders</div><div class="card-value">${d.orders.length}</div></div>
    <div class="card"><div class="card-label">Physical Sales</div><div class="card-value">${d.physical.length}</div></div>
    <div class="card"><div class="card-label">Avg Order Value</div><div class="card-value">₦${((d.orders.length + d.physical.length) === 0 ? 0 : Math.round(d.combinedRevenue / (d.orders.length + d.physical.length))).toLocaleString()}</div></div>
  </div>

  <h2>Online Orders</h2>
  ${d.orders.length === 0 ? '<p style="color:#888">No online orders in this period.</p>' : table(
    ['Order ID', 'Customer', 'Phone', 'Type', 'Status', 'Total (₦)', 'Date'],
    d.orders.map((o: any) => [
      o.visual_id || o.id, o.customer_name, o.customer_phone, o.type, o.status,
      `₦${(o.total || 0).toLocaleString()}`,
      new Date(o.created_at).toLocaleString('en-NG'),
    ])
  )}

  <h2>Physical Sales Log</h2>
  ${d.physical.length === 0 ? '<p style="color:#888">No physical sales in this period.</p>' : table(
    ['Item', 'Qty', 'Unit Price', 'Total', 'Date', 'Logged By', 'Notes'],
    d.physical.map((p: any) => [
      p.item_name, p.quantity_sold,
      `₦${Number(p.unit_price).toLocaleString()}`,
      `₦${Number(p.total_amount).toLocaleString()}`,
      p.sale_date, p.logged_by, p.notes || '—',
    ])
  )}

  <h2>Top Items (Combined)</h2>
  ${table(
    ['Rank', 'Item', 'Total Sold'],
    d.topItems.map(([name, qty]: [string, number], i: number) => [`${i + 1}`, name, `${qty}x`])
  )}

  <h2>Daily Revenue Breakdown</h2>
  ${table(
    ['Date', 'Online (₦)', 'Physical (₦)', 'Combined (₦)'],
    d.daily.filter(r => r.total > 0).map(r => [
      r.date, `₦${r.online.toLocaleString()}`, `₦${r.physical.toLocaleString()}`, `₦${r.total.toLocaleString()}`,
    ])
  )}

  <h2>Inventory Snapshot</h2>
  ${table(
    ['Item', 'Stock Count', 'Tracking', 'Status'],
    d.inv.map((i: any) => [
      i.item_name, i.stock_count, i.track_inventory ? 'Yes' : 'No',
      i.stock_count === 0 ? '<span class="badge out">Out of Stock</span>'
        : i.stock_count <= 3 ? '<span class="badge low">Low Stock</span>'
        : '<span class="badge ok">OK</span>',
    ])
  )}

  <footer>Reeplay Lounge &amp; Club — Confidential Report</footer>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { showToast('Allow popups to download PDF'); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
  showToast('PDF ready — Print → Save as PDF');
};

  const sendReport = async (range: 'today' | 'week' | 'month' | 'custom', customStartDate?: Date, customEndDate?: Date) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
      end = now;
    } else if (range === 'week') {
      start.setDate(now.getDate() - 7);
      end = now;
    } else if (range === 'month') {
      start.setDate(now.getDate() - 30);
      end = now;
    } else if (range === 'custom' && customStartDate && customEndDate) {
      start = customStartDate;
      end = customEndDate;
      end.setHours(23, 59, 59, 999);
    }

    const { data } = await supabase.from('orders').select('*').eq('payment_status', 'paid').gte('created_at', start.toISOString()).lte('created_at', end.toISOString());

    if (!data || data.length === 0) { showToast('No orders in this period.'); return; }

    const totalRevenue = data.reduce((t: number, o: any) => t + (o.total || 0), 0);
    const pickupCount = data.filter((o: any) => o.type === 'pickup').length;
    const deliveryCount = data.filter((o: any) => o.type === 'delivery').length;
    const avgOrder = Math.round(totalRevenue / data.length);

    const itemMap: Record<string, number> = {};
    data.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const name = item.name?.split(' (')[0];
        if (!name) return;
        const skip = ['plastic container', 'paper bag', 'delivery fee', 'vat', 'packaging', 'tax', 'service'];
        if (skip.some(k => name.toLowerCase().includes(k))) return;
        itemMap[name] = (itemMap[name] || 0) + item.quantity;
      });
    });
    const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const rangeLabel = range === 'today' ? 'Today' : range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;

    const lines = [
      `📊 *REEPLAY REPORT — ${rangeLabel.toUpperCase()}*`,
      `--------------------------------`,
      `💰 Revenue: ₦${totalRevenue.toLocaleString()}`,
      `🧾 Orders: ${data.length}`,
      `📦 Avg Order: ₦${avgOrder.toLocaleString()}`,
      `🛍️ Pickup: ${pickupCount} | Delivery: ${deliveryCount}`,
      `--------------------------------`,
      `🏆 *Top Items:*`,
      ...topItems.map(([name, qty], i) => `${i + 1}. ${name} — ${qty}x`),
      `--------------------------------`,
      `_Reeplay Lounge & Club_`,
    ];

    window.open(`https://wa.me/2349061203547?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
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
    const { error } = await supabase.storage.from('gallery').upload(fileName, file);
    if (error) { showToast('Upload failed: ' + error.message); setUploading(false); return; }
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
    if (activeView === 'analytics') fetchAnalytics();
    if (activeView === 'inventory') fetchInventory();
    if (activeView === 'physicallog') { fetchPhysicalLogs(); fetchInventory(); }
  }, [activeView, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn, activeView]);

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
          <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl">Login</button>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN UI ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      <div className="bg-[#18181b] border-b border-white/10 p-4 flex justify-between items-center">
        <h1 className="font-black text-lg">Reeplay Admin</h1>
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="flex border-b border-white/10 overflow-x-auto">
        {[
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'menu', label: 'Menu', icon: Menu },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'gallery', label: 'Gallery', icon: Image },
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'physicallog', label: 'Daily Log', icon: ClipboardList },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveView(tab.id as AdminView); if (tab.id === 'orders') setNewOrderCount(0); }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all
              ${activeView === tab.id ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
            {tab.id === 'orders' && newOrderCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{newOrderCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-4xl mx-auto overflow-visible">

        {/* --- ORDERS --- */}
        {activeView === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Incoming Orders</h2>
              <button onClick={() => fetchOrders()} className="text-xs text-purple-400 hover:text-purple-300">Refresh</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', 'Pending', 'Confirmed', 'Out for Delivery', 'Completed'].map(f => (
                <button key={f} onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${orderFilter === f ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
            {ordersLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
              orders.length === 0 ? <p className="text-gray-500 text-center mt-8">No orders yet.</p> : (
                orders.filter(o => orderFilter === 'all' || o.status?.toLowerCase() === orderFilter.toLowerCase()).map(order => (
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
                      {order.items?.map((item: any, i: number) => <div key={i}>{item.quantity}x {item.name}</div>)}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {STATUSES.map(s => (
                        <button key={s} onClick={() => updateOrderStatus(order.id, s)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${order.status?.toLowerCase() === s.toLowerCase() ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
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
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap capitalize transition-all ${activeCategory === cat ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
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
                      <input type="text" value={item.description} onChange={e => handleMenuChange(item.id, 'description', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-gray-300 mt-1 outline-none focus:border-purple-500" />
                    </div>
                    <button onClick={() => handleMenuChange(item.id, 'is_sold_out', !item.is_sold_out)} className="shrink-0">
                      {item.is_sold_out ? <ToggleRight className="w-8 h-8 text-red-500" /> : <ToggleLeft className="w-8 h-8 text-gray-500" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">₦</span>
                    <input type="number" value={item.price} onChange={e => handleMenuChange(item.id, 'price', parseInt(e.target.value))}
                      className="w-32 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-yellow-400 font-mono outline-none focus:border-purple-500" />
                    {item.is_sold_out && <span className="text-xs text-red-400 font-bold">SOLD OUT</span>}
                    <button onClick={() => updateMenuItem(item)} className="ml-auto flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold">
                      {savingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
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
              <button onClick={() => setShowNewEventForm(!showNewEventForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold">
                <Plus className="w-3 h-3" /> Add Event
              </button>
            </div>
            {showNewEventForm && (
              <div className="bg-[#18181b] border border-purple-500/30 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-purple-400">New Event</h3>
                {[
                  { key: 'title', placeholder: 'Event Title *' },
                  { key: 'date', placeholder: 'Display Date (e.g. March 20th)' },
                  { key: 'time', placeholder: 'Time (e.g. 10:00 PM)' },
                  { key: 'category', placeholder: 'Category (e.g. Themed Party)' },
                  { key: 'image_url', placeholder: 'Image URL' },
                  { key: 'price', placeholder: 'Price (e.g. Free Entry / ₦5,000)' },
                ].map(field => (
                  <input key={field.key} placeholder={field.placeholder} value={(newEvent as any)[field.key] || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-500" />
                ))}

                {/* Countdown date — separate from display date */}
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Countdown Date (for timer)</label>
                  <input
                    type="date"
                    value={(newEvent as any).event_date || ''}
                    onChange={e => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-500 mt-1"
                  />
                </div>

                <textarea placeholder="Description" value={newEvent.description || ''} onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-500 resize-none h-20" />
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
                          {event.is_active ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-500" />}
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

        {/* --- INVENTORY --- */}
        {activeView === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Inventory Manager</h2>
              <button onClick={fetchInventory} className="text-xs text-purple-400 hover:text-purple-300">Refresh</button>
            </div>
            <div className="bg-[#18181b] border border-purple-500/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-purple-400">Add Item to Track</h3>
              <div className="flex gap-2">
                <input placeholder="Item name (e.g. Heineken)" value={newItemName} onChange={e => setNewItemName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500" />
                <input type="number" placeholder="Stock" value={newItemStock} onChange={e => setNewItemStock(parseInt(e.target.value) || 0)}
                  className="w-20 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500" />
                <button onClick={addInventoryItem} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {inventoryLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
              inventory.length === 0 ? <p className="text-gray-500 text-center mt-8">No items being tracked yet.</p> : (
                inventory.map(item => (
                  <div key={item.id} className="bg-[#18181b] border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-bold text-white">{item.item_name}</p>
                        <p className={`text-xs font-bold mt-0.5 ${item.stock_count === 0 ? 'text-red-400' : item.stock_count <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {item.stock_count === 0 ? 'OUT OF STOCK' : item.stock_count <= 3 ? `LOW STOCK — ${item.stock_count} left` : `${item.stock_count} in stock`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleTrack(item.id, item.track_inventory)}>
                          {item.track_inventory ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-500" />}
                        </button>
                        <button onClick={() => deleteInventoryItem(item.id)} className="p-1 hover:text-red-400 text-gray-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateStock(item.id, Math.max(0, item.stock_count - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input type="number" value={item.stock_count} onChange={e => updateStock(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white text-center outline-none focus:border-purple-500" />
                      <button onClick={() => updateStock(item.id, item.stock_count + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 text-white">
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500">units</span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}

        {/* --- ANALYTICS --- */}
        {activeView === 'analytics' && (
            <div className="space-y-6 overflow-visible">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Weekly Analytics</h2>
              <div className="flex items-center gap-3">
                <button onClick={fetchAnalytics} className="text-xs text-purple-400 hover:text-purple-300">Refresh</button>
                <div className="relative">
                  <button
                    onClick={() => setShowReportOptions(!showReportOptions)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold"
                  >
                    <Download className="w-3 h-3" /> Reports
                  </button>

                  {showReportOptions && (
                    <div className="absolute right-0 top-8 bg-[#18181b] border border-white/10 rounded-xl p-3 z-50 w-64 space-y-2 shadow-2xl">

                      {/* WhatsApp */}
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </p>
                      {(['today', 'week', 'month'] as const).map(r => (
                        <button key={r} onClick={() => { sendReport(r); setShowReportOptions(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/10 text-gray-300">
                          {r === 'today' ? 'Today' : r === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                        </button>
                      ))}

                      {/* PDF */}
                      <div className="border-t border-white/10 pt-2 space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Download className="w-3 h-3" /> Download PDF
                        </p>
                        {(['today', 'week', 'month'] as const).map(r => (
                          <button key={r} onClick={() => { downloadPDF(r); setShowReportOptions(false); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-purple-900/40 text-purple-300">
                            {r === 'today' ? 'Today' : r === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                          </button>
                        ))}
                      </div>

                      {/* CSV */}
                      <div className="border-t border-white/10 pt-2 space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <Download className="w-3 h-3" /> Download CSV
                        </p>
                        {(['today', 'week', 'month'] as const).map(r => (
                          <button key={r} onClick={() => { downloadCSV(r); setShowReportOptions(false); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-900/40 text-green-300">
                            {r === 'today' ? 'Today' : r === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                          </button>
                        ))}
                      </div>

                      {/* Custom Range */}
                      <div className="border-t border-white/10 pt-2 space-y-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Custom Range</p>
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none" />
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none" />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { if (!customStart || !customEnd) return; sendReport('custom', new Date(customStart), new Date(customEnd)); setShowReportOptions(false); }}
                            className="flex-1 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                            <MessageCircle className="w-3 h-3" /> WA
                          </button>
                          <button
                            onClick={() => { if (!customStart || !customEnd) return; downloadPDF('custom', new Date(customStart), new Date(customEnd)); setShowReportOptions(false); }}
                            className="flex-1 py-1.5 bg-purple-700 hover:bg-purple-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                            <Download className="w-3 h-3" /> PDF
                          </button>
                          <button
                            onClick={() => { if (!customStart || !customEnd) return; downloadCSV('custom', new Date(customStart), new Date(customEnd)); setShowReportOptions(false); }}
                            className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                            <Download className="w-3 h-3" /> CSV
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>

            {analyticsLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : !analytics ? (
              <p className="text-gray-500 text-center mt-8">No data yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Online Revenue', value: `₦${analytics.onlineRevenue.toLocaleString()}`, change: null },
                    { label: 'Physical Revenue', value: `₦${analytics.physicalRevenue.toLocaleString()}`, change: null },
                    { label: 'Combined Total', value: `₦${analytics.combinedRevenue.toLocaleString()}`, change: analytics.revenueChange },
                    { label: 'Online Orders', value: analytics.onlineCount, change: analytics.countChange },
                    { label: 'Physical Sales', value: analytics.physicalCount, change: null },
                    { label: 'Avg Order Value', value: `₦${analytics.avgOrder.toLocaleString()}`, change: null },
                    { label: 'Pickup vs Delivery', value: `${analytics.pickupCount} / ${analytics.deliveryCount}`, change: null },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#18181b] border border-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                      <p className="text-white font-black text-xl">{stat.value}</p>
                      {stat.change !== null && (
                        <p className={`text-xs font-bold mt-1 ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}% vs last week
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-[#18181b] border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Daily Revenue (Last 7 Days)</p>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-600 inline-block" /> Online</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-600 inline-block" /> Physical</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {analytics.dailyRevenue.map((d: any) => {
                      const max = Math.max(...analytics.dailyRevenue.map((x: any) => x.online + x.physical));
                      const onlineHeight = max === 0 ? 0 : Math.round((d.online / max) * 100);
                      const physicalHeight = max === 0 ? 0 : Math.round((d.physical / max) * 100);
                      const total = d.online + d.physical;
                      return (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                          <p className="text-[9px] text-gray-500 font-mono">{total > 0 ? `₦${(total / 1000).toFixed(0)}k` : ''}</p>
                          <div className="w-full bg-white/5 rounded-t-md relative" style={{ height: '80px' }}>
                            <div className="absolute bottom-0 w-full bg-green-600 rounded-t-md transition-all duration-500" style={{ height: `${physicalHeight}%` }} />
                            <div className="absolute bottom-0 w-full bg-purple-600 rounded-t-md transition-all duration-500" style={{ height: `${onlineHeight}%`, marginBottom: `${physicalHeight}%` }} />
                          </div>
                          <p className="text-[9px] text-gray-500">{d.day}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#18181b] border border-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Top Items This Week</p>
                  {analytics.topItems.length === 0 ? <p className="text-gray-500 text-sm">No orders this week yet.</p> : (
                    <div className="space-y-3">
                      {analytics.topItems.map(([name, qty]: [string, number], i: number) => {
                        const max = analytics.topItems[0][1];
                        return (
                          <div key={name} className="flex items-center gap-3">
                            <span className="text-purple-400 font-black text-sm w-4">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-white text-sm font-bold">{name}</span>
                                <span className="text-gray-400 text-xs">{qty}x</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full">
                                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${(qty / max) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

         {/* --- PHYSICAL SALES LOG --- */}
        {activeView === 'physicallog' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Daily Physical Sales Log</h2>
              <button onClick={fetchPhysicalLogs} className="text-xs text-purple-400 hover:text-purple-300">Refresh</button>
            </div>

            {/* Add Entry Form */}
            <div className="bg-[#18181b] border border-purple-500/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-purple-400">Log Physical Sale</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Item Name</label>
                  <input
                    placeholder="e.g. Heineken"
                    value={logItem}
                    onChange={e => setLogItem(e.target.value)}
                    list="inventory-items"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500 mt-1"
                  />
                  <datalist id="inventory-items">
                    {inventory.map(i => <option key={i.id} value={i.item_name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Qty Sold</label>
                  <input
                    type="number"
                    min={1}
                    value={logQty}
                    onChange={e => setLogQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Unit Price (₦)</label>
                  <input
                    type="number"
                    min={0}
                    value={logPrice}
                    onChange={e => setLogPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Logged By</label>
                  <input
                    placeholder="Manager"
                    value={loggedBy}
                    onChange={e => setLoggedBy(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Sale Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={e => setLogDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500 mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Notes (Optional)</label>
                  <input
                    placeholder="e.g. Table 5, Cash payment"
                    value={logNotes}
                    onChange={e => setLogNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-purple-500 mt-1"
                  />
                </div>
              </div>
              <button
                onClick={addPhysicalLog}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold mt-1"
              >
                Log Sale & Update Inventory
              </button>
            </div>

            {/* Log Entries */}
            {physicalLogsLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
              physicalLogs.length === 0 ? (
                <p className="text-gray-500 text-center mt-8">No physical sales logged yet.</p>
              ) : (
                physicalLogs.map(log => (
                  <div key={log.id} className="bg-[#18181b] border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{log.item_name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {log.quantity_sold}x @ ₦{Number(log.unit_price).toLocaleString()} = <span className="text-yellow-500 font-mono font-bold">₦{Number(log.total_amount).toLocaleString()}</span>
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{log.sale_date} • Logged by {log.logged_by}</p>
                        {log.notes && <p className="text-purple-300 text-xs mt-0.5">📝 {log.notes}</p>}
                      </div>
                      <button onClick={() => deletePhysicalLog(log.id)} className="p-1 hover:text-red-400 text-gray-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                    <button onClick={() => deleteGalleryImage(img.id, img.image_url)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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