/**
 * Réponses rapides pour commerçants
 * EcoPanier
 */

import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Edit2 } from 'lucide-react';
import { fetchQuickReplyTemplates, createQuickReplyTemplate, deleteQuickReplyTemplate } from '@/utils/messagingService';
import type { QuickReplyTemplate, QuickReplyCategory } from '@/lib/messaging.types';
import { QUICK_REPLY_CATEGORIES, MAX_TEMPLATE_LENGTH } from '@/lib/messaging.types';

interface QuickRepliesProps {
  merchantId: string;
  onSelect: (content: string) => void;
}

export function QuickReplies({ merchantId, onSelect }: QuickRepliesProps) {
  const [templates, setTemplates] = useState<QuickReplyTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les templates
  useEffect(() => {
    loadTemplates();
  }, [merchantId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchQuickReplyTemplates(merchantId);
      setTemplates(data);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template: QuickReplyTemplate) => {
    onSelect(template.content);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Supprimer ce modèle de réponse ?')) return;

    try {
      await deleteQuickReplyTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="border-t-2 border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Zap className="w-4 h-4 text-primary-500" />
          <span>Réponses rapides</span>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          {showCreateForm ? 'Annuler' : 'Nouvelle'}
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <CreateTemplateForm
          onSuccess={() => {
            setShowCreateForm(false);
            loadTemplates();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Liste des templates */}
      {templates.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative"
            >
              <button
                onClick={() => handleSelect(template)}
                className="
                  px-3 py-1.5 rounded-full text-xs font-medium
                  bg-white border-2 border-neutral-300
                  hover:border-primary-500 hover:bg-primary-50
                  transition-all duration-200
                  flex items-center gap-2
                "
                title={template.content}
              >
                <Zap className="w-3 h-3 text-primary-500" />
                <span className="max-w-[150px] truncate">{template.title}</span>
                {template.usage_count > 0 && (
                  <span className="text-neutral-500">({template.usage_count})</span>
                )}
              </button>
              
              {/* Bouton de suppression */}
              <button
                onClick={() => handleDelete(template.id)}
                className="
                  absolute -top-1 -right-1
                  w-5 h-5 rounded-full bg-accent-500 text-white
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  flex items-center justify-center
                  hover:bg-accent-600
                "
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-500 text-center py-2">
          Aucun modèle de réponse. Créez-en un pour gagner du temps !
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Formulaire de création de template
// ============================================================================

interface CreateTemplateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateTemplateForm({ onSuccess, onCancel }: CreateTemplateFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<QuickReplyCategory>('general');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      await createQuickReplyTemplate({
        title: title.trim(),
        content: content.trim(),
        category,
      });
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Impossible de créer le modèle de réponse');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border-2 border-neutral-300 p-4 mb-3">
      <div className="space-y-3">
        {/* Titre */}
        <div>
          <label htmlFor="template-title" className="block text-xs font-medium text-neutral-700 mb-1">
            Titre
          </label>
          <input
            id="template-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Réponse allergènes"
            maxLength={50}
            className="
              w-full px-3 py-2 text-sm
              border-2 border-neutral-300 rounded-lg
              focus:border-primary-500 focus:outline-none
            "
            required
          />
        </div>

        {/* Contenu */}
        <div>
          <label htmlFor="template-content" className="block text-xs font-medium text-neutral-700 mb-1">
            Contenu
          </label>
          <textarea
            id="template-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ex: Ce lot ne contient pas d'allergènes courants. Pour plus de détails, n'hésitez pas à me demander."
            maxLength={MAX_TEMPLATE_LENGTH}
            rows={3}
            className="
              w-full px-3 py-2 text-sm
              border-2 border-neutral-300 rounded-lg
              focus:border-primary-500 focus:outline-none
              resize-none
            "
            required
          />
          <div className="text-xs text-neutral-500 text-right mt-1">
            {content.length}/{MAX_TEMPLATE_LENGTH}
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label htmlFor="template-category" className="block text-xs font-medium text-neutral-700 mb-1">
            Catégorie
          </label>
          <select
            id="template-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as QuickReplyCategory)}
            className="
              w-full px-3 py-2 text-sm
              border-2 border-neutral-300 rounded-lg
              focus:border-primary-500 focus:outline-none
            "
          >
            {Object.entries(QUICK_REPLY_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Boutons */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="
              flex-1 px-4 py-2 text-sm font-medium
              bg-primary-500 text-white rounded-lg
              hover:bg-primary-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {saving ? 'Création...' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="
              px-4 py-2 text-sm font-medium
              bg-neutral-200 text-neutral-700 rounded-lg
              hover:bg-neutral-300
              transition-colors
            "
          >
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}

