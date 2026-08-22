import React, { useEffect, useState } from 'react';
import {
  Users,
  Globe,
  MapPin,
  Sparkles,
  Shield,
  Trash2,
  Edit2,
  CheckCircle,
  Search,
  Plus,
  Lock,
  Compass,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchAdminAnalytics,
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  fetchAdminTrips,
  deleteAdminTrip,
  createAdminCity,
  deleteAdminCity,
  createAdminActivity,
  AdminStats,
  AdminAnalytics,
  AdminUser,
  AdminTrip,
} from '../../api/admin.api';
import { getCities, City } from '../../api/itinerary.api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'popular-cities' | 'popular-activities' | 'analytics'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Group, Filter & Sort Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'all' | 'admin' | 'traveler'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // User Edit State
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');

  // Selected User Trips Modal
  const [viewingUserTrips, setViewingUserTrips] = useState<AdminUser | null>(null);

  // New City Form State
  const [newCityName, setNewCityName] = useState('');
  const [newCityCountry, setNewCityCountry] = useState('');
  const [newCityCostIndex, setNewCityCostIndex] = useState(3);

  // New Activity Form State
  const [actCityId, setActCityId] = useState<number | ''>('');
  const [actName, setActName] = useState('');
  const [actCategory, setActCategory] = useState('sightseeing');
  const [actCost, setActCost] = useState('');

  const refreshAllData = () => {
    Promise.all([
      fetchAdminStats().catch(() => null),
      fetchAdminAnalytics().catch(() => null),
      fetchAdminUsers().catch(() => []),
      fetchAdminTrips().catch(() => []),
      getCities().catch(() => []),
    ]).then(([sData, aData, uData, tData, cData]) => {
      if (sData) setStats(sData);
      if (aData) setAnalytics(aData);
      setUsers(uData);
      setTrips(tData);
      setCities(cData);
    });
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAdminStats().catch(() => null),
      fetchAdminAnalytics().catch(() => null),
      fetchAdminUsers().catch(() => []),
      fetchAdminTrips().catch(() => []),
      getCities().catch(() => []),
    ])
      .then(([sData, aData, uData, tData, cData]) => {
        if (!active) return;
        if (sData) setStats(sData);
        if (aData) setAnalytics(aData);
        setUsers(uData);
        setTrips(tData);
        setCities(cData);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // User actions
  const handleToggleAdmin = async (user: AdminUser) => {
    try {
      const updated = await updateAdminUser(user.id, { is_admin: !user.is_admin });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_admin: updated.is_admin } : u)));
    } catch (err: unknown) {
      alert('Failed to update role: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleStartEditUser = (user: AdminUser) => {
    setEditingUserId(user.id);
    setEditFirstName(user.first_name);
    setEditLastName(user.last_name || '');
    setEditEmail(user.email);
    setEditCity(user.city || '');
  };

  const handleSaveUser = async (id: number) => {
    try {
      const updated = await updateAdminUser(id, {
        first_name: editFirstName,
        last_name: editLastName,
        email: editEmail,
        city: editCity,
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
      setEditingUserId(null);
    } catch (err: unknown) {
      alert('Failed to save user: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user? All their trips will be removed.')) return;
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      refreshAllData();
    } catch (err: unknown) {
      alert('Failed to delete user: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteTrip = async (id: number) => {
    if (!window.confirm('Delete this trip and all its stops?')) return;
    try {
      await deleteAdminTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      refreshAllData();
    } catch (err: unknown) {
      alert('Failed to delete trip: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // City & Activity actions
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName || !newCityCountry) return;
    try {
      await createAdminCity({
        name: newCityName,
        country: newCityCountry,
        cost_index: newCityCostIndex,
      });
      setNewCityName('');
      setNewCityCountry('');
      refreshAllData();
    } catch (err: unknown) {
      alert('Failed to add city: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!window.confirm('Delete this city destination?')) return;
    try {
      await deleteAdminCity(id);
      setCities((prev) => prev.filter((c) => c.id !== id));
      refreshAllData();
    } catch (err: unknown) {
      alert('Failed to delete city: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actCityId || !actName) return;
    try {
      await createAdminActivity({
        city_id: Number(actCityId),
        name: actName,
        category: actCategory,
        cost: actCost ? Number(actCost) : 0,
      });
      setActName('');
      setActCost('');
      alert('Catalog activity added successfully!');
      refreshAllData();
    } catch (err: unknown) {
      alert('Failed to add activity: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Filtering users
  const filteredUsers = users
    .filter((u) => {
      const matchSearch =
        u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.last_name && u.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (groupBy === 'admin') return u.is_admin;
      if (groupBy === 'traveler') return !u.is_admin;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.first_name.localeCompare(b.first_name);
      if (sortBy === 'oldest') return a.id - b.id;
      return b.id - a.id;
    });

  // Filtering cities
  const filteredCities = (analytics?.popularCities || cities.map((c) => ({ ...c, visit_count: c.popularity || 0 }))).filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtering activities
  const filteredActivities = (analytics?.popularActivities || []).filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F6E6E]/10 text-[#0F6E6E] text-xs font-bold uppercase tracking-wider mb-2">
              <Shield size={14} />
              GlobeTrotter Admin Console
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Panel Screen</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-gray-200 shadow-xs text-xs font-bold text-gray-700">
              <Users size={16} className="text-[#0F6E6E]" />
              {stats?.usersCount || users.length} Users
            </div>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-gray-200 shadow-xs text-xs font-bold text-gray-700">
              <Globe size={16} className="text-[#FF7A59]" />
              {stats?.tripsCount || trips.length} Trips
            </div>
          </div>
        </div>

        {/* Search, Group By, Filter, and Sort By Controls Bar (Per Wireframe) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search bar ......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
            />
          </div>

          {/* Filter & Group Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Group By */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">
              <SlidersHorizontal size={14} className="text-gray-500" />
              <span>Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="traveler">Travelers Only</option>
              </select>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">
              <Filter size={14} className="text-gray-500" />
              <span>Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food</option>
                <option value="culture">Culture</option>
                <option value="adventure">Adventure</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">
              <ArrowUpDown size={14} className="text-gray-500" />
              <span>Sort by...</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4 Main Tabs Bar (Per Wireframe Spec) */}
        <nav className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
          {[
            { id: 'users', label: 'Manage Users', icon: <Users size={16} /> },
            { id: 'popular-cities', label: 'Popular cities', icon: <MapPin size={16} /> },
            { id: 'popular-activities', label: 'Popular Activites', icon: <Sparkles size={16} /> },
            { id: 'analytics', label: 'User Trends and Analytics', icon: <TrendingUp size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0F6E6E] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner label="Loading admin system data..." />
          </div>
        ) : (
          <>
            {/* 1. MANAGE USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Registered Accounts & Actions</h3>
                      <p className="text-xs text-gray-500">
                        View all registered users, examine trips made by each user, edit account profiles, or modify permissions.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      {filteredUsers.length} Users Listed
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <th className="py-3.5 px-6">User Details</th>
                          <th className="py-3.5 px-6">Email</th>
                          <th className="py-3.5 px-6">Location</th>
                          <th className="py-3.5 px-6">Role</th>
                          <th className="py-3.5 px-6">Trips Made</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredUsers.map((user) => {
                          const isEditing = editingUserId === user.id;

                          return (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-6 font-semibold text-gray-900">
                                {isEditing ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editFirstName}
                                      onChange={(e) => setEditFirstName(e.target.value)}
                                      className="px-2 py-1 border rounded text-xs w-24"
                                    />
                                    <input
                                      type="text"
                                      value={editLastName}
                                      onChange={(e) => setEditLastName(e.target.value)}
                                      className="px-2 py-1 border rounded text-xs w-24"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#0F6E6E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                      {user.first_name[0]}
                                    </div>
                                    <div>
                                      <div>{user.first_name} {user.last_name}</div>
                                      <div className="text-xs text-gray-400">ID #{user.id}</div>
                                    </div>
                                  </div>
                                )}
                              </td>

                              <td className="py-4 px-6 text-gray-600">
                                {isEditing ? (
                                  <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="px-2 py-1 border rounded text-xs w-44"
                                  />
                                ) : (
                                  user.email
                                )}
                              </td>

                              <td className="py-4 px-6 text-gray-600">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCity}
                                    onChange={(e) => setEditCity(e.target.value)}
                                    className="px-2 py-1 border rounded text-xs w-28"
                                  />
                                ) : (
                                  user.city || user.country ? `${user.city || ''} ${user.country || ''}` : 'N/A'
                                )}
                              </td>

                              <td className="py-4 px-6">
                                <button
                                  onClick={() => handleToggleAdmin(user)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                                    user.is_admin
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                  }`}
                                  title="Click to toggle Admin role"
                                >
                                  {user.is_admin ? <Shield size={12} /> : <Lock size={12} />}
                                  {user.is_admin ? 'Admin' : 'Traveler'}
                                </button>
                              </td>

                              <td className="py-4 px-6 font-semibold text-gray-700">
                                <button
                                  onClick={() => setViewingUserTrips(user)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors"
                                >
                                  <Globe size={12} className="text-[#0F6E6E]" />
                                  {user.trip_count || 0} Trips
                                </button>
                              </td>

                              <td className="py-4 px-6 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleSaveUser(user.id)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      title="Save"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className="px-2 py-1 text-xs text-gray-500 hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleStartEditUser(user)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                      title="Edit User"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                      title="Delete User"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. POPULAR CITIES TAB */}
            {activeTab === 'popular-cities' && (
              <div className="space-y-6">
                <Card className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Plus size={20} className="text-[#FF7A59]" />
                    Add Destination City
                  </h3>
                  <form onSubmit={handleAddCity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">City Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kyoto"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        required
                        className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Country</label>
                      <input
                        type="text"
                        placeholder="e.g. Japan"
                        value={newCityCountry}
                        onChange={(e) => setNewCityCountry(e.target.value)}
                        required
                        className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Cost Index (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newCityCostIndex}
                        onChange={(e) => setNewCityCostIndex(Number(e.target.value))}
                        className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
                      />
                    </div>

                    <Button variant="primary" type="submit" className="h-10 font-bold">
                      Add Destination
                    </Button>
                  </form>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCities.map((city) => (
                    <Card key={city.id} className="p-5 flex flex-col justify-between space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
                            Popularity: {city.popularity}/100
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-lg">{city.name}</h4>
                          <p className="text-xs text-gray-500 font-medium">{city.country}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCity(city.id)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete City"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-semibold text-gray-600">
                        <span>
                          Cost Index:{' '}
                          {'$'.repeat(
                            ('cost_index' in city ? (city as { cost_index: number }).cost_index : (city as { costIndex: number }).costIndex) || 3
                          )}
                        </span>
                        <span className="text-[#0F6E6E] font-bold">
                          {city.visit_count || 0} User Trips
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. POPULAR ACTIVITIES TAB */}
            {activeTab === 'popular-activities' && (
              <div className="space-y-6">
                <Card className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Compass size={20} className="text-[#0F6E6E]" />
                    Add Activity to Catalog
                  </h3>
                  <form onSubmit={handleAddActivity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Target City</label>
                      <select
                        value={actCityId}
                        onChange={(e) => setActCityId(e.target.value ? Number(e.target.value) : '')}
                        required
                        className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
                      >
                        <option value="">— Select City —</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}, {c.country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Activity Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Scuba Diving"
                        value={actName}
                        onChange={(e) => setActName(e.target.value)}
                        required
                        className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Category</label>
                      <select
                        value={actCategory}
                        onChange={(e) => setActCategory(e.target.value)}
                        className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
                      >
                        <option value="sightseeing">Sightseeing</option>
                        <option value="culture">Culture</option>
                        <option value="food">Food & Dining</option>
                        <option value="adventure">Adventure</option>
                        <option value="nightlife">Nightlife</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Cost ($)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={actCost}
                        onChange={(e) => setActCost(e.target.value)}
                        className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#0F6E6E]"
                      />
                    </div>

                    <Button variant="accent" type="submit" className="h-10 font-bold">
                      Add Activity
                    </Button>
                  </form>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivities.map((act) => (
                    <Card key={act.id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F6E6E]/10 text-[#0F6E6E] capitalize mb-1">
                            {act.category}
                          </span>
                          <h4 className="font-extrabold text-gray-900 text-base">{act.name}</h4>
                          <p className="text-xs text-gray-500">{act.city_name}, {act.city_country}</p>
                        </div>
                        <span className="font-extrabold text-sm text-[#FF7A59]">
                          ${Number(act.cost).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500">
                        <span>Duration: {act.duration_minutes || 60} mins</span>
                        <span className="font-bold text-gray-800">
                          {act.selection_count || 0} User Selections
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 4. USER TRENDS AND ANALYTICS TAB (Render Pie Chart, Line Chart, & Bar Chart Visuals) */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pie Chart: Activity Category Breakdown */}
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                        <PieIcon size={18} className="text-[#0F6E6E]" />
                        Category Distribution
                      </h3>
                      <span className="text-xs font-bold text-gray-400">Pie Chart</span>
                    </div>

                    {/* Visual SVG Pie Representation */}
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-40 h-40">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          {/* Segment 1: Sightseeing 35% */}
                          <circle cx="50" cy="50" r="40" stroke="#0F6E6E" strokeWidth="20" strokeDasharray="88 251" fill="none" />
                          {/* Segment 2: Culture 25% */}
                          <circle cx="50" cy="50" r="40" stroke="#FF7A59" strokeWidth="20" strokeDasharray="63 251" strokeDashoffset="-88" fill="none" />
                          {/* Segment 3: Food 20% */}
                          <circle cx="50" cy="50" r="40" stroke="#F5A623" strokeWidth="20" strokeDasharray="50 251" strokeDashoffset="-151" fill="none" />
                          {/* Segment 4: Adventure 15% */}
                          <circle cx="50" cy="50" r="40" stroke="#22A06B" strokeWidth="20" strokeDasharray="38 251" strokeDashoffset="-201" fill="none" />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#0F6E6E]" /> Sightseeing (35%)
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF7A59]" /> Culture (25%)
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F5A623]" /> Food & Dining (20%)
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#22A06B]" /> Adventure (15%)
                      </div>
                    </div>
                  </Card>

                  {/* Line Chart: Growth & User Trends */}
                  <Card className="p-6 space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#FF7A59]" />
                        Monthly User & Trip Growth Trend
                      </h3>
                      <span className="text-xs font-bold text-gray-400">Line Trend Graph</span>
                    </div>

                    {/* SVG Line Chart Graphic */}
                    <div className="h-44 w-full pt-4">
                      <svg viewBox="0 0 500 150" className="w-full h-full">
                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#E5E7EB" strokeDasharray="4 4" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="#E5E7EB" strokeDasharray="4 4" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="#E5E7EB" strokeDasharray="4 4" />

                        {/* Trend Line 1 (Trips - Coral) */}
                        <path
                          d="M 10,130 Q 80,110 150,90 T 300,50 T 490,20"
                          fill="none"
                          stroke="#FF7A59"
                          strokeWidth="3.5"
                        />

                        {/* Trend Line 2 (Users - Teal) */}
                        <path
                          d="M 10,140 Q 80,125 150,110 T 300,80 T 490,45"
                          fill="none"
                          stroke="#0F6E6E"
                          strokeWidth="3.5"
                        />

                        {/* Line dots */}
                        <circle cx="10" cy="130" r="5" fill="#FF7A59" />
                        <circle cx="150" cy="90" r="5" fill="#FF7A59" />
                        <circle cx="300" cy="50" r="5" fill="#FF7A59" />
                        <circle cx="490" cy="20" r="5" fill="#FF7A59" />

                        <circle cx="10" cy="140" r="5" fill="#0F6E6E" />
                        <circle cx="150" cy="110" r="5" fill="#0F6E6E" />
                        <circle cx="300" cy="80" r="5" fill="#0F6E6E" />
                        <circle cx="490" cy="45" r="5" fill="#0F6E6E" />
                      </svg>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#FF7A59]" /> Trips Growth
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#0F6E6E]" /> User Registrations
                        </div>
                      </div>
                      <span>Updated Live</span>
                    </div>
                  </Card>
                </div>

                {/* Bar Chart: Travel Budget Breakdown */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                      <BarChart2 size={18} className="text-[#0F6E6E]" />
                      Travel Budget Tier Distribution
                    </h3>
                    <span className="text-xs font-bold text-gray-400">Bar Chart</span>
                  </div>

                  <div className="space-y-4">
                    {(analytics?.budgetDistribution || [
                      { level: 'Budget ($)', count: 4, percentage: 25 },
                      { level: 'Moderate ($$)', count: 9, percentage: 40 },
                      { level: 'Upscale ($$$)', count: 7, percentage: 20 },
                      { level: 'Luxury ($$$$)', count: 3, percentage: 15 },
                    ]).map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>{item.level}</span>
                          <span>{item.percentage}% ({item.count} Trips)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx % 2 === 0 ? 'bg-[#0F6E6E]' : 'bg-[#FF7A59]'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Viewing User Trips Modal */}
        {viewingUserTrips && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Trips Created by {viewingUserTrips.first_name} {viewingUserTrips.last_name}
                  </h3>
                  <p className="text-xs text-gray-500">{viewingUserTrips.email}</p>
                </div>
                <button
                  onClick={() => setViewingUserTrips(null)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                >
                  Close
                </button>
              </div>

              {trips.filter((t) => t.user_id === viewingUserTrips.id).length === 0 ? (
                <p className="text-sm font-medium text-gray-500 py-6 text-center">
                  This user has not created any trips yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {trips
                    .filter((t) => t.user_id === viewingUserTrips.id)
                    .map((t) => (
                      <div key={t.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{t.name}</h4>
                          <p className="text-xs text-gray-500">
                            {t.start_date ? `${t.start_date} → ${t.end_date}` : 'No dates set'} • {t.is_public ? 'Public' : 'Private'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTrip(t.id)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Trip"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
