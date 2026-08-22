import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, Clock, Sparkles, Compass } from 'lucide-react';
import Button from '../../components/Button';
import {
  getActivities,
  createStopActivity,
  deleteStopActivity,
  type Stop,
  type Activity,
} from '../../api/itinerary.api';

interface StopActivitiesProps {
  stopId?: number;
  cityId?: number | null;
  onChange?: () => void;
  stop?: Stop;
  onChanged?: () => void;
}

const categoryStyles: Record<string, string> = {
  sightseeing: 'bg-orange-50 text-orange-700 border-orange-200/80',
  culture: 'bg-purple-50 text-purple-700 border-purple-200/80',
  food: 'bg-amber-50 text-amber-700 border-amber-200/80',
  adventure: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  nightlife: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
};

export default function StopActivities({
  stopId: propStopId,
  cityId: propCityId,
  onChange: propOnChange,
  stop,
  onChanged,
}: StopActivitiesProps) {
  const effectiveStopId = propStopId ?? stop?.id;
  const effectiveCityId = propCityId ?? stop?.cityId;
  const notifyChanged = propOnChange ?? onChanged ?? (() => {});

  const [available, setAvailable] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<number | ''>('');
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [busy, setBusy] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (effectiveCityId) {
      getActivities({ cityId: effectiveCityId })
        .then((res) => {
          if (active) setAvailable(res);
        })
        .catch(() => {
          if (active) setAvailable([]);
        });
    }
    return () => {
      active = false;
    };
  }, [effectiveCityId]);

  async function addExisting() {
    setCatalogError(null);
    if (!effectiveStopId) return;
    if (selected === '') {
      setCatalogError('Please select an activity from the catalog first.');
      return;
    }
    setBusy(true);
    try {
      await createStopActivity(effectiveStopId, { activityId: Number(selected) });
      setSelected('');
      notifyChanged();
    } finally {
      setBusy(false);
    }
  }

  async function addCustom(e: FormEvent) {
    e.preventDefault();
    setCustomError(null);
    if (!effectiveStopId) return;
    if (!customName.trim()) {
      setCustomError('Please enter an activity name first.');
      return;
    }
    setBusy(true);
    try {
      await createStopActivity(effectiveStopId, {
        customName: customName.trim(),
        customCost: customCost ? Number(customCost) : 0,
      });
      setCustomName('');
      setCustomCost('');
      notifyChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    await deleteStopActivity(id);
    notifyChanged();
  }

  const activities = stop?.activities ?? [];

  return (
    <div className="border-t border-border/80 pt-4 mt-3">
      {activities.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {activities.map((a) => {
            const cat = a.activity?.category?.toLowerCase() ?? 'other';
            const catStyle =
              categoryStyles[cat] ?? 'bg-slate-100 text-slate-700 border-slate-200';
            const name = a.activity?.name ?? a.customName ?? 'Activity';
            const cost = a.customCost || a.activity?.cost || 0;

            return (
              <li
                key={a.id}
                className="group flex items-center justify-between rounded-xl bg-surface px-4 py-2.5 border border-border/80 shadow-xs hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{name}</span>
                  {a.activity?.category && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${catStyle} capitalize`}
                    >
                      {a.activity.category}
                    </span>
                  )}
                  {a.activity?.durationMinutes ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" />
                      {a.activity.durationMinutes} min
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    ${cost.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="rounded-lg p-1.5 text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Remove activity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mb-4 text-xs font-medium text-muted italic">
          No activities planned for this stop yet. Add one from the catalog or create a custom one.
        </p>
      )}

      {/* Form area: side-by-side catalog picker & custom activity form */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 rounded-2xl bg-bg/60 p-4 border border-border/60">
        {/* Catalog Activity Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Add from City Catalog
          </label>
          <div className="flex gap-2">
            <select
              className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-slate-800 shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value ? Number(e.target.value) : '');
                setCatalogError(null);
              }}
            >
              <option value="">— Choose activity —</option>
              {available.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (${a.cost})
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              onClick={addExisting}
              disabled={busy}
              className="h-10 px-4 shrink-0 bg-primary text-white hover:bg-primary-dark font-bold opacity-100 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {catalogError && <p className="text-xs font-semibold text-danger mt-1">{catalogError}</p>}
        </div>

        {/* Custom Activity Form */}
        <form onSubmit={addCustom} className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-accent flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Add Custom Activity
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Activity name"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                setCustomError(null);
              }}
              className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-500 shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="number"
              placeholder="Cost ($)"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
              className="h-10 w-24 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-500 shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              variant="accent"
              type="submit"
              disabled={busy}
              className="h-10 px-4 shrink-0 bg-accent text-white hover:bg-accent-dark font-bold opacity-100 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {customError && <p className="text-xs font-semibold text-danger mt-1">{customError}</p>}
        </form>
      </div>
    </div>
  );
}
