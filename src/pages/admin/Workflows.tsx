import { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, Filter, MoreVertical, Calendar, X,
  ChevronDown, ArrowRight, Clock, CheckCircle2,
  AlertTriangle, User, GripVertical, Trash2,
  Eye, Tag
} from 'lucide-react';
import { workflows as initialWorkflows, clients } from '../../data/mockData';
import type { Workflow } from '../../data/mockData';
import './Workflows.css';

type ColumnId = 'in-progress' | 'todo' | 'review' | 'filed';

interface Column {
  id: ColumnId;
  title: string;
  color: string;
  icon: React.ReactNode;
}

const columns: Column[] = [
  { id: 'in-progress', title: 'In Progress', color: 'var(--color-warning)', icon: <Clock size={14} /> },
  { id: 'todo', title: 'Pending Client', color: 'var(--color-info)', icon: <AlertTriangle size={14} /> },
  { id: 'review', title: 'Under Review', color: 'var(--color-accent-primary)', icon: <Eye size={14} /> },
  { id: 'filed', title: 'Completed', color: 'var(--color-success)', icon: <CheckCircle2 size={14} /> }
];

const priorityOptions = ['low', 'medium', 'high', 'critical'] as const;
const typeOptions = ['GST', 'TDS', 'Income Tax', 'Audit', 'ROC', 'Payroll'] as const;

export default function Workflows() {
  const [workflowList, setWorkflowList] = useState<Workflow[]>(
    initialWorkflows.map(w => ({ ...w }))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // New workflow modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    title: '',
    client: '',
    type: 'GST',
    assignee: '',
    dueDate: '',
    priority: 'medium' as Workflow['priority'],
    status: 'todo' as ColumnId
  });

  // Workflow detail modal
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  // Card context menu
  const [cardMenu, setCardMenu] = useState<string | null>(null);
  const cardMenuRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ColumnId | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (cardMenuRef.current && !cardMenuRef.current.contains(e.target as Node)) {
        setCardMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ---- Filtering ----
  const filteredWorkflows = workflowList.filter(w => {
    const matchSearch = !searchTerm ||
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || w.type === filterType;
    const matchPriority = filterPriority === 'all' || w.priority === filterPriority;
    const matchAssignee = filterAssignee === 'all' || w.assignee === filterAssignee;
    return matchSearch && matchType && matchPriority && matchAssignee;
  });

  const getColumnWorkflows = (colId: ColumnId) =>
    filteredWorkflows.filter(w => w.status === colId);

  // ---- Active filter count ----
  const activeFilterCount = [filterType, filterPriority, filterAssignee].filter(f => f !== 'all').length;

  // ---- Unique assignees ----
  const assignees = [...new Set(initialWorkflows.map(w => w.assignee))];

  // ---- Drag & Drop ----
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    if (draggedId) {
      setWorkflowList(prev =>
        prev.map(w => w.id === draggedId
          ? { ...w, status: colId, progress: colId === 'filed' ? 100 : w.progress }
          : w)
      );
    }
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverCol(null);
  };

  // ---- Move workflow via button ----
  const moveWorkflow = (id: string, newStatus: ColumnId) => {
    setWorkflowList(prev =>
      prev.map(w => w.id === id
        ? { ...w, status: newStatus, progress: newStatus === 'filed' ? 100 : w.progress }
        : w)
    );
    setCardMenu(null);
    setSelectedWorkflow(null);
  };

  // ---- Delete workflow ----
  const deleteWorkflow = (id: string) => {
    setWorkflowList(prev => prev.filter(w => w.id !== id));
    setCardMenu(null);
    setSelectedWorkflow(null);
  };

  // ---- Create workflow ----
  const handleCreateWorkflow = () => {
    if (!newWorkflow.title || !newWorkflow.client) return;
    const id = `w${Date.now()}`;
    const wf: Workflow = {
      id,
      title: newWorkflow.title,
      client: newWorkflow.client,
      clientId: '',
      type: newWorkflow.type,
      status: newWorkflow.status,
      assignee: newWorkflow.assignee || 'Anand',
      dueDate: newWorkflow.dueDate || 'TBD',
      priority: newWorkflow.priority,
      progress: 0,
    };
    setWorkflowList(prev => [...prev, wf]);
    setShowNewModal(false);
    setNewWorkflow({ title: '', client: '', type: 'GST', assignee: '', dueDate: '', priority: 'medium', status: 'todo' });
  };

  // ---- Helpers ----
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critical': return { bg: 'rgba(248,113,113,0.15)', color: 'var(--color-error)' };
      case 'high': return { bg: 'rgba(251,191,36,0.15)', color: 'var(--color-warning)' };
      case 'medium': return { bg: 'rgba(96,165,250,0.15)', color: 'var(--color-info)' };
      case 'low': return { bg: 'rgba(52,211,153,0.15)', color: 'var(--color-success)' };
      default: return { bg: 'rgba(96,165,250,0.15)', color: 'var(--color-info)' };
    }
  };

  const clearAllFilters = () => {
    setFilterType('all');
    setFilterPriority('all');
    setFilterAssignee('all');
  };

  return (
    <div className="wf-page">
      {/* Header */}
      <div className="wf-header">
        <div>
          <h1 className="font-serif wf-title">Service Workflows</h1>
          <p className="wf-subtitle">
            Track and manage active assignments across all clients.
            <span className="wf-count">{filteredWorkflows.length} of {workflowList.length} workflows</span>
          </p>
        </div>
        <div className="wf-toolbar">
          {/* Search */}
          <div className="wf-search">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search workflows..."
              id="workflow-search-input"
            />
            {searchTerm && (
              <button className="wf-search-clear" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="wf-filter-wrapper" ref={filterRef}>
            <button
              className={`wf-filter-btn ${filterOpen || activeFilterCount > 0 ? 'wf-filter-btn--active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
              id="workflow-filter-btn"
            >
              <Filter size={16} />
              Filter
              {activeFilterCount > 0 && (
                <span className="wf-filter-badge">{activeFilterCount}</span>
              )}
            </button>

            {filterOpen && (
              <div className="wf-filter-dropdown" id="workflow-filter-dropdown">
                <div className="wf-filter-dropdown__header">
                  <h4>Filters</h4>
                  {activeFilterCount > 0 && (
                    <button className="wf-filter-clear" onClick={clearAllFilters}>Clear all</button>
                  )}
                </div>

                {/* Type filter */}
                <div className="wf-filter-group">
                  <label>Type</label>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} id="filter-type-select">
                    <option value="all">All Types</option>
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Priority filter */}
                <div className="wf-filter-group">
                  <label>Priority</label>
                  <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} id="filter-priority-select">
                    <option value="all">All Priorities</option>
                    {priorityOptions.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>

                {/* Assignee filter */}
                <div className="wf-filter-group">
                  <label>Assignee</label>
                  <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} id="filter-assignee-select">
                    <option value="all">All Assignees</option>
                    {assignees.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* New Workflow */}
          <button className="wf-new-btn" onClick={() => setShowNewModal(true)} id="new-workflow-btn">
            <Plus size={16} />
            New Workflow
          </button>
        </div>
      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <div className="wf-active-filters">
          {filterType !== 'all' && (
            <span className="wf-tag">
              <Tag size={12} /> Type: {filterType}
              <button onClick={() => setFilterType('all')}><X size={12} /></button>
            </span>
          )}
          {filterPriority !== 'all' && (
            <span className="wf-tag">
              <Tag size={12} /> Priority: {filterPriority}
              <button onClick={() => setFilterPriority('all')}><X size={12} /></button>
            </span>
          )}
          {filterAssignee !== 'all' && (
            <span className="wf-tag">
              <User size={12} /> {filterAssignee}
              <button onClick={() => setFilterAssignee('all')}><X size={12} /></button>
            </span>
          )}
          <button className="wf-clear-all" onClick={clearAllFilters}>Clear all</button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="wf-board">
        {columns.map(col => {
          const colWorkflows = getColumnWorkflows(col.id);
          return (
            <div
              key={col.id}
              className={`wf-column ${dragOverCol === col.id ? 'wf-column--drag-over' : ''}`}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.id)}
              id={`column-${col.id}`}
            >
              {/* Column Header */}
              <div className="wf-column__header">
                <div className="wf-column__title-group">
                  <div className="wf-column__dot" style={{ background: col.color }} />
                  <h3 className="wf-column__title">{col.title}</h3>
                  <span className="wf-column__count">{colWorkflows.length}</span>
                </div>
              </div>

              {/* Cards */}
              <div className="wf-column__cards">
                {colWorkflows.length === 0 ? (
                  <div className="wf-column__empty">
                    <span>No workflows</span>
                  </div>
                ) : (
                  colWorkflows.map(wf => {
                    const pColor = getPriorityColor(wf.priority);
                    return (
                      <div
                        key={wf.id}
                        className={`wf-card ${draggedId === wf.id ? 'wf-card--dragging' : ''}`}
                        draggable
                        onDragStart={e => handleDragStart(e, wf.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedWorkflow(wf)}
                        id={`workflow-card-${wf.id}`}
                      >
                        <div className="wf-card__grip">
                          <GripVertical size={12} />
                        </div>

                        <div className="wf-card__header">
                          <span className="wf-card__type" style={{ color: col.color }}>{wf.type}</span>
                          <div className="wf-card__menu-wrapper" ref={cardMenu === wf.id ? cardMenuRef : undefined}>
                            <button
                              className="wf-card__menu-btn"
                              onClick={e => { e.stopPropagation(); setCardMenu(cardMenu === wf.id ? null : wf.id); }}
                            >
                              <MoreVertical size={14} />
                            </button>
                            {cardMenu === wf.id && (
                              <div className="wf-card__context-menu" onClick={e => e.stopPropagation()}>
                                {columns.filter(c => c.id !== col.id).map(c => (
                                  <button key={c.id} onClick={() => moveWorkflow(wf.id, c.id)}>
                                    <ArrowRight size={14} style={{ color: c.color }} />
                                    Move to {c.title}
                                  </button>
                                ))}
                                <div className="context-menu-divider" />
                                <button className="context-menu-danger" onClick={() => deleteWorkflow(wf.id)}>
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="wf-card__client">{wf.client}</div>
                        <div className="wf-card__title-text">{wf.title}</div>

                        {/* Progress */}
                        <div className="wf-card__progress">
                          <div className="wf-card__progress-bar">
                            <div
                              className="wf-card__progress-fill"
                              style={{ width: `${wf.progress}%`, background: col.color }}
                            />
                          </div>
                          <span className="wf-card__progress-text">{wf.progress}%</span>
                        </div>

                        <div className="wf-card__footer">
                          <div className="wf-card__date">
                            <Calendar size={12} />
                            {wf.dueDate}
                          </div>
                          <span
                            className="wf-card__priority"
                            style={{ background: pColor.bg, color: pColor.color }}
                          >
                            {wf.priority}
                          </span>
                        </div>
                        <div className="wf-card__assignee">
                          <div className="wf-card__assignee-avatar">
                            {wf.assignee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{wf.assignee}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Workflow Detail Modal ===== */}
      {selectedWorkflow && (
        <div className="wf-modal-overlay" onClick={() => { setSelectedWorkflow(null); setEditingStatus(null); }}>
          <div className="wf-modal" onClick={e => e.stopPropagation()}>
            <div className="wf-modal__header">
              <div>
                <span className="wf-modal__type-badge" style={{
                  background: columns.find(c => c.id === selectedWorkflow.status)?.color,
                }}>
                  {selectedWorkflow.type}
                </span>
                <h2>{selectedWorkflow.title}</h2>
              </div>
              <button className="wf-modal__close" onClick={() => { setSelectedWorkflow(null); setEditingStatus(null); }}>
                <X size={20} />
              </button>
            </div>

            <div className="wf-modal__body">
              <div className="wf-modal__detail-grid">
                <div className="wf-modal__detail">
                  <span className="wf-modal__label">Client</span>
                  <span className="wf-modal__value">{selectedWorkflow.client}</span>
                </div>
                <div className="wf-modal__detail">
                  <span className="wf-modal__label">Assignee</span>
                  <span className="wf-modal__value">{selectedWorkflow.assignee}</span>
                </div>
                <div className="wf-modal__detail">
                  <span className="wf-modal__label">Due Date</span>
                  <span className="wf-modal__value">{selectedWorkflow.dueDate}</span>
                </div>
                <div className="wf-modal__detail">
                  <span className="wf-modal__label">Priority</span>
                  <span className="wf-modal__value" style={{ color: getPriorityColor(selectedWorkflow.priority).color }}>
                    {selectedWorkflow.priority.charAt(0).toUpperCase() + selectedWorkflow.priority.slice(1)}
                  </span>
                </div>
                <div className="wf-modal__detail">
                  <span className="wf-modal__label">Progress</span>
                  <div className="wf-modal__progress">
                    <div className="wf-modal__progress-bar">
                      <div className="wf-modal__progress-fill" style={{ width: `${selectedWorkflow.progress}%` }} />
                    </div>
                    <span>{selectedWorkflow.progress}%</span>
                  </div>
                </div>
                <div className="wf-modal__detail">
                  <span className="wf-modal__label">Status</span>
                  <div className="wf-modal__status">
                    {editingStatus === selectedWorkflow.id ? (
                      <div className="wf-modal__status-options">
                        {columns.map(c => (
                          <button
                            key={c.id}
                            className={`wf-status-option ${selectedWorkflow.status === c.id ? 'wf-status-option--active' : ''}`}
                            style={{ '--col-color': c.color } as React.CSSProperties}
                            onClick={() => {
                              moveWorkflow(selectedWorkflow.id, c.id);
                              setSelectedWorkflow({ ...selectedWorkflow, status: c.id });
                              setEditingStatus(null);
                            }}
                          >
                            {c.icon} {c.title}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        className="wf-modal__status-btn"
                        onClick={() => setEditingStatus(selectedWorkflow.id)}
                        style={{ color: columns.find(c => c.id === selectedWorkflow.status)?.color }}
                      >
                        {columns.find(c => c.id === selectedWorkflow.status)?.title}
                        <ChevronDown size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="wf-modal__actions">
              {selectedWorkflow.status !== 'filed' && (
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    const nextStatus = selectedWorkflow.status === 'todo' ? 'in-progress'
                      : selectedWorkflow.status === 'in-progress' ? 'review'
                      : 'filed';
                    moveWorkflow(selectedWorkflow.id, nextStatus as ColumnId);
                    setSelectedWorkflow({ ...selectedWorkflow, status: nextStatus as ColumnId, progress: nextStatus === 'filed' ? 100 : selectedWorkflow.progress });
                  }}
                >
                  <ArrowRight size={16} />
                  Move to {
                    selectedWorkflow.status === 'todo' ? 'In Progress'
                    : selectedWorkflow.status === 'in-progress' ? 'Under Review'
                    : 'Completed'
                  }
                </button>
              )}
              <button className="btn btn--outline" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                onClick={() => deleteWorkflow(selectedWorkflow.id)}
              >
                <Trash2 size={16} />
                Delete Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== New Workflow Modal ===== */}
      {showNewModal && (
        <div className="wf-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="wf-modal wf-modal--new" onClick={e => e.stopPropagation()}>
            <div className="wf-modal__header">
              <h2>Create New Workflow</h2>
              <button className="wf-modal__close" onClick={() => setShowNewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="wf-modal__body">
              <div className="wf-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g. GST Return - Q1 FY26-27"
                  value={newWorkflow.title}
                  onChange={e => setNewWorkflow(prev => ({ ...prev, title: e.target.value }))}
                  id="new-workflow-title"
                />
              </div>

              <div className="wf-form-row">
                <div className="wf-form-group">
                  <label>Client *</label>
                  <select
                    value={newWorkflow.client}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, client: e.target.value }))}
                    id="new-workflow-client"
                  >
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="wf-form-group">
                  <label>Type</label>
                  <select
                    value={newWorkflow.type}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, type: e.target.value }))}
                    id="new-workflow-type"
                  >
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="wf-form-row">
                <div className="wf-form-group">
                  <label>Assignee</label>
                  <select
                    value={newWorkflow.assignee}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, assignee: e.target.value }))}
                    id="new-workflow-assignee"
                  >
                    <option value="">Select assignee</option>
                    {assignees.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="wf-form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newWorkflow.dueDate}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, dueDate: e.target.value }))}
                    id="new-workflow-date"
                  />
                </div>
              </div>

              <div className="wf-form-row">
                <div className="wf-form-group">
                  <label>Priority</label>
                  <div className="wf-priority-selector">
                    {priorityOptions.map(p => (
                      <button
                        key={p}
                        className={`wf-priority-btn ${newWorkflow.priority === p ? 'wf-priority-btn--active' : ''}`}
                        style={{ '--p-color': getPriorityColor(p).color, '--p-bg': getPriorityColor(p).bg } as React.CSSProperties}
                        onClick={() => setNewWorkflow(prev => ({ ...prev, priority: p }))}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="wf-form-group">
                  <label>Initial Status</label>
                  <select
                    value={newWorkflow.status}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, status: e.target.value as ColumnId }))}
                    id="new-workflow-status"
                  >
                    {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="wf-modal__actions">
              <button
                className="btn btn--primary"
                onClick={handleCreateWorkflow}
                disabled={!newWorkflow.title || !newWorkflow.client}
                id="create-workflow-submit"
              >
                <Plus size={16} />
                Create Workflow
              </button>
              <button className="btn btn--outline" onClick={() => setShowNewModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
