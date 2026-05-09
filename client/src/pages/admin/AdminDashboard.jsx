import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, TrendingUp, DollarSign } from 'lucide-react';
import { SocketContext } from '../../context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiUrl } from '../../lib/api';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`glass-panel p-8 rounded-xl flex items-center justify-between shadow-2xl relative overflow-hidden group`}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: color }}></div>
    <div className="relative z-10 flex flex-col justify-between h-full w-full">
        <div className="flex items-start justify-between mb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant">{title}</span>
            <div style={{ color }}>{icon}</div>
        </div>
        <div className="font-headline-md text-headline-md text-primary">{value}</div>
    </div>
  </div>
);

const currency = (value) => `$${Number(value || 0).toLocaleString()}`;

const buildChartData = (orders) => {
  const buckets = new Map();

  [...orders]
    .filter(order => order?.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((order) => {
      const label = new Date(order.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      buckets.set(label, (buckets.get(label) || 0) + Number(order.totalPrice || 0));
    });

  return Array.from(buckets.entries()).slice(-8).map(([time, sales]) => ({ time, sales }));
};

const formatFeedItem = (order) => ({
  id: order._id,
  title: order.orderItems?.[0]?.name || 'Order',
  name: order.shippingDetails?.name || 'Customer',
  totalPrice: Number(order.totalPrice || 0),
  paymentMethod: order.paymentMethod || 'COD',
  createdAt: order.createdAt,
  status: order.status || 'pending',
});

const AdminDashboard = () => {
  const { socket, activeUsers } = useContext(SocketContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [liveFeed, setLiveFeed] = useState([]);
  const [chartData, setChartData] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;

    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch(apiUrl('/api/orders'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(apiUrl('/api/admin/users'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const users = usersRes.ok ? await usersRes.json() : [];

      const normalizedOrders = Array.isArray(orders) ? orders : [];
      const normalizedUsers = Array.isArray(users) ? users : [];

      setTotalOrders(normalizedOrders.length);
      setTotalRevenue(normalizedOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0));
      setTotalUsers(normalizedUsers.length);
      setLiveFeed(normalizedOrders.slice(0, 10).map(formatFeedItem));
      setChartData(buildChartData(normalizedOrders));
    } catch (error) {
      console.error('Failed to load admin dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      const normalized = formatFeedItem(order);

      toast.success(`New order received for ${currency(normalized.totalPrice)}!`, {
        icon: '💰',
        style: {
          borderRadius: '8px',
          background: '#1e2020',
          color: '#c8c6c5',
          border: '1px solid #444748',
        },
      });

      setTotalOrders(prev => prev + 1);
      setTotalRevenue(prev => prev + normalized.totalPrice);
      setLiveFeed(prev => [normalized, ...prev].slice(0, 10));
      setChartData(prev => {
        const next = [...prev];
        const time = new Date(normalized.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const lastValue = next.length ? next[next.length - 1].sales : 0;
        next.push({ time, sales: lastValue + normalized.totalPrice });
        return next.slice(-8);
      });
    };

    socket.on('NEW_ORDER', handleNewOrder);
    socket.on('admin_authenticated', loadDashboard);

    return () => {
      socket.off('NEW_ORDER', handleNewOrder);
      socket.off('admin_authenticated', loadDashboard);
    };
  }, [socket]);

  return (
    <div className="w-full page-transition pb-24">
      <Toaster position="top-right"/>
      
      <div className="flex justify-between items-center mb-12">
        <h1 className="font-headline-md text-headline-md text-primary">System Overview (LIVE)</h1>
        <div className="flex items-center gap-2 text-secondary font-label-caps text-label-caps tracking-widest bg-secondary/10 px-4 py-2 rounded-full border border-secondary/30">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_#e9c349]"></span>
          Socket Channel Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-12">
        <StatCard title="Active Users" value={activeUsers} icon={<Users size={24}/>} color="#e9c349" />
        <StatCard title="Total Orders" value={loading ? '...' : totalOrders} icon={<Package size={24}/>} color="#c8c6c5" />
        <StatCard title="Total Revenue" value={loading ? '...' : currency(totalRevenue)} icon={<DollarSign size={24}/>} color="#e9c349" />
        <StatCard title="Registered Users" value={loading ? '...' : totalUsers} icon={<TrendingUp size={24}/>} color="#c8c6c5" />
      </div>

      <h2 className="font-headline-sm text-headline-sm text-primary mb-4">Quick Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-12">
        <div 
          onClick={() => navigate('/admin/products?gender=Male')}
          className="glass-panel p-6 rounded-xl flex items-center justify-between cursor-pointer hover:-translate-y-1 transition-all border border-white/5 hover:border-primary shadow-xl group"
        >
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">Manage Men's Collection</h3>
            <p className="text-on-surface-variant font-body-md text-[14px]">Add, update, or delete products for men.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
             <span className="material-symbols-outlined">man</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/products?gender=Female')}
          className="glass-panel p-6 rounded-xl flex items-center justify-between cursor-pointer hover:-translate-y-1 transition-all border border-white/5 hover:border-secondary shadow-xl group"
        >
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-secondary transition-colors">Manage Women's Collection</h3>
            <p className="text-on-surface-variant font-body-md text-[14px]">Add, update, or delete products for women.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
             <span className="material-symbols-outlined">woman</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 glass-panel p-8 rounded-xl border border-white/5 shadow-2xl">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-8 border-b border-white/5 pb-4">Real-Time Sales Trend</h3>
          {chartData.length === 0 ? (
            <p className="text-on-surface-variant font-body-md text-center py-12">No completed orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="time" stroke="#8e9192" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#8e9192" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                    contentStyle={{background:'rgba(30,32,32,0.9)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px'}}
                    itemStyle={{color: '#e9c349'}}
                />
                <Line type="monotone" dataKey="sales" stroke="#e9c349" strokeWidth={3} dot={{r: 4, fill: '#1a1a1a', stroke: '#e9c349', strokeWidth: 2}} activeDot={{r: 6, fill: '#e9c349', stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-1 glass-panel p-8 rounded-xl border border-white/5 shadow-2xl h-[450px] overflow-hidden flex flex-col">
          <div className="mb-6 border-b border-white/5 pb-4">
              <h3 className="font-headline-sm text-headline-sm text-primary">Live Tracking Feed</h3>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Latest incoming socket.io orders</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar flex flex-col gap-4">
            {liveFeed.length === 0 ? <p className="text-on-surface-variant font-body-md text-center py-12">No live orders yet.</p> : (
              liveFeed.map((order) => (
                <div key={order.id} className="p-4 bg-surface-container-low border border-white/5 rounded-lg border-l-2 border-l-secondary animate-[fadeSlideUp_0.4s_ease-out]">
                  <strong className="font-body-md text-primary block mb-1 truncate">{order.name}</strong>
                  <span className="font-body-md text-on-surface-variant block mb-2 truncate">{order.title}</span>
                  <span className="font-label-caps text-[10px] text-secondary tracking-widest block uppercase">
                      {currency(order.totalPrice)} • {order.paymentMethod}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
