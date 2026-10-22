import React, { useState } from 'react';
import {
  Flower2,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Ruler,
  History,
  Info,
  Check,
  Copy,
  Wifi,
  Sliders,
  Trash2,
  Download,
  ArrowRight,
} from 'lucide-react';

interface PredictionResponse {
  codigo?: number;
  dados_recebidos: {
    sepal_length: number;
    sepal_width: number;
    petal_length: number;
    petal_width: number;
  };
  predicao: string;
}

interface HistoryItem {
  id: string;
  timestamp: string;
  predicao: string;
  codigo?: number;
  dados: {
    sepal_length: number;
    sepal_width: number;
    petal_length: number;
    petal_width: number;
  };
  latencyMs?: number;
}

interface FormState {
  sepal_length: string;
  sepal_width: string;
  petal_length: string;
  petal_width: string;
}

const PRESETS = [
  {
    name: 'Iris Virginica (Padrão)',
    tag: 'Virginica',
    desc: 'Pétalas longas (> 5.0cm) e largas (> 2.0cm)',
    values: { sepal_length: '6.7', sepal_width: '3.0', petal_length: '5.2', petal_width: '2.3' },
  },
  {
    name: 'Iris Setosa (Compacta)',
    tag: 'Setosa',
    desc: 'Pétalas minúsculas (< 2.0cm) e sépalas largas',
    values: { sepal_length: '5.1', sepal_width: '3.5', petal_length: '1.4', petal_width: '0.2' },
  },
  {
    name: 'Iris Versicolor (Intermediária)',
    tag: 'Versicolor',
    desc: 'Dimensões médias equilibradas em pétalas e sépalas',
    values: { sepal_length: '6.0', sepal_width: '2.9', petal_length: '4.5', petal_width: '1.5' },
  },
];

const SPECIES_INFO: Record<string, {
  name: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}> = {
  virginica: {
    name: 'Iris Virginica',
    subtitle: 'Espécie com flores proeminentes e pétalas alongadas',
    accentColor: '#8b5cf6',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    description: 'Nativa do leste da América do Norte, a Iris virginica distingue-se pelas pétalas maiores e tons profundos de violeta.',
  },
  setosa: {
    name: 'Iris Setosa',
    subtitle: 'Espécie ártica com pétalas atrofiadas características',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    description: 'Comum em regiões litorâneas frias como Alasca e Sibéria. É a espécie mais facilmente separável linearmente no dataset.',
  },
  versicolor: {
    name: 'Iris Versicolor',
    subtitle: 'A clássica flor-de-lis azul da América do Norte',
    accentColor: '#0284c7',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-300',
    description: 'Possui porte intermediário entre Setosa e Virginica, frequentemente encontrada em margens de riachos e áreas pantanosas.',
  },
};

export default function App() {
  const [formData, setFormData] = useState<FormState>({
    sepal_length: '6.7',
    sepal_width: '3.0',
    petal_length: '5.2',
    petal_width: '2.3',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>({
    codigo: 2,
    dados_recebidos: {
      petal_length: 5.2,
      petal_width: 2.3,
      sepal_length: 6.7,
      sepal_width: 3.0,
    },
    predicao: 'Virginica',
  });
  const [lastLatency, setLastLatency] = useState<number | null>(185);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'dataset'>('visual');

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'init-1',
      timestamp: '11:18:00',
      predicao: 'Virginica',
      codigo: 2,
      dados: { sepal_length: 6.7, sepal_width: 3.0, petal_length: 5.2, petal_width: 2.3 },
      latencyMs: 185,
    },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (presetValues: FormState) => {
    setFormData(presetValues);
    setError(null);
  };

  const handleReset = () => {
    setFormData({
      sepal_length: '5.8',
      sepal_width: '3.0',
      petal_length: '4.0',
      petal_width: '1.3',
    });
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const sLength = parseFloat(formData.sepal_length);
    const sWidth = parseFloat(formData.sepal_width);
    const pLength = parseFloat(formData.petal_length);
    const pWidth = parseFloat(formData.petal_width);

    // Validação
    if (
      isNaN(sLength) || isNaN(sWidth) || isNaN(pLength) || isNaN(pWidth) ||
      sLength <= 0 || sWidth <= 0 || pLength <= 0 || pWidth <= 0
    ) {
      setError('Por favor, informe valores numéricos válidos e positivos para todas as 4 medidas morfológicas.');
      setLoading(false);
      return;
    }

    if (sLength > 15 || sWidth > 15 || pLength > 15 || pWidth > 15) {
      setError('Os valores parecem excessivamente altos para a espécie Iris (geralmente entre 0.1 e 9.0 cm).');
      setLoading(false);
      return;
    }

    const payload = {
      sepal_length: sLength,
      sepal_width: sWidth,
      petal_length: pLength,
      petal_width: pWidth,
    };

    const startTime = performance.now();

    try {
      const response = await fetch('https://deployappflask.onrender.com/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLastLatency(elapsed);

      if (!response.ok) {
        throw new Error(`O servidor retornou erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PredictionResponse = await response.json();

      if (!data || typeof data.predicao === 'undefined') {
        throw new Error('A resposta recebida da API não possui a chave "predicao" esperada.');
      }

      setResult(data);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        predicao: data.predicao,
        codigo: data.codigo,
        dados: payload,
        latencyMs: elapsed,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha desconhecida na requisição';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError(
          'Não foi possível alcançar a API no Render. Se a instância gratuita estiver acordando (Cold Start), aguarde cerca de 25 segundos e clique em "Tentar Novamente".'
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentSpeciesKey = result?.predicao?.toLowerCase() || '';
  const speciesDetails = SPECIES_INFO[currentSpeciesKey] || {
    name: result?.predicao ? `Iris ${result.predicao}` : 'Iris Desconhecida',
    subtitle: 'Classificação floral retornada pelo algoritmo',
    accentColor: '#7c3aed',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    badgeBorder: 'border-violet-300',
    description: 'A predição foi calculada pelo modelo de Machine Learning treinado sobre o dataset Iris.',
  };

  const copyResultJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportHistoryJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `iris_predictions_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Cálculos para o visualizador morfológico
  const numSL = parseFloat(formData.sepal_length) || 6.0;
  const numSW = parseFloat(formData.sepal_width) || 3.0;
  const numPL = parseFloat(formData.petal_length) || 4.5;
  const numPW = parseFloat(formData.petal_width) || 1.5;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-violet-100 selection:text-violet-900">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-violet-200">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Iris AI Classifier
                </h1>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200/60 hidden sm:inline-block">
                  Vite + React
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Dashboard morfológico conectado à API Flask no Render
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px]">API Online</span>
              {lastLatency && (
                <span className="text-emerald-600/70 text-[10px] hidden md:inline">({lastLatency}ms)</span>
              )}
            </div>

            <a
              href="https://deployappflask.onrender.com/api/predict"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100 hidden md:flex items-center gap-1"
              title="Endpoint de predição"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">/api/predict</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Banner de erro amigável se houver */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-600" />
            <div className="flex-1 text-sm">
              <h4 className="font-bold text-rose-900 mb-0.5">Aviso na Requisição</h4>
              <p className="text-rose-700 leading-relaxed">{error}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                >
                  Tentar Novamente
                </button>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="px-2 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                >
                  Dispensar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Cards: Grid de Presets rápidos */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Exemplos de Referência Rápida
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Clique em uma das espécies do dataset clássico para carregar as medidas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESETS.map((preset) => {
              const isSelected =
                formData.sepal_length === preset.values.sepal_length &&
                formData.petal_length === preset.values.petal_length;

              return (
                <button
                  key={preset.tag}
                  type="button"
                  onClick={() => handleApplyPreset(preset.values)}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                    isSelected
                      ? 'border-violet-600 ring-2 ring-violet-500/20 bg-violet-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition-colors">
                      {preset.name}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2 leading-relaxed">{preset.desc}</p>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <span>SL: {preset.values.sepal_length}</span>
                    <span>•</span>
                    <span>SW: {preset.values.sepal_width}</span>
                    <span>•</span>
                    <span>PL: {preset.values.petal_length}</span>
                    <span>•</span>
                    <span>PW: {preset.values.petal_width}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Grid: Form (Esquerda) vs Destaque da Predição (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna 1: Formulário Morfológico (7 colunas) */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-violet-600" />
                  Entrada de Medidas da Flor
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ajuste os valores numericamente ou através dos controles deslizantes (em centímetros)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-slate-500" />
                  Escala: cm
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seção Sépalas */}
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Dimensões da Sépala (Sepal)
                  </span>
                  <span className="text-[11px] text-slate-400">Camada externa de suporte</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sepal Length */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="sepal_length" className="text-xs font-semibold text-slate-700">
                        Sepal Length (Comprimento)
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                        {formData.sepal_length || '0'} cm
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="12.0"
                      required
                      id="sepal_length"
                      name="sepal_length"
                      value={formData.sepal_length}
                      onChange={handleChange}
                      placeholder="Ex: 6.7"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 outline-none transition-all shadow-2xs"
                    />
                    <input
                      type="range"
                      min="4.0"
                      max="8.5"
                      step="0.1"
                      value={formData.sepal_length || 6.0}
                      onChange={(e) => handleSliderChange('sepal_length', e.target.value)}
                      className="w-full mt-2 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Sepal Width */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="sepal_width" className="text-xs font-semibold text-slate-700">
                        Sepal Width (Largura)
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                        {formData.sepal_width || '0'} cm
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10.0"
                      required
                      id="sepal_width"
                      name="sepal_width"
                      value={formData.sepal_width}
                      onChange={handleChange}
                      placeholder="Ex: 3.0"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 outline-none transition-all shadow-2xs"
                    />
                    <input
                      type="range"
                      min="2.0"
                      max="4.5"
                      step="0.1"
                      value={formData.sepal_width || 3.0}
                      onChange={(e) => handleSliderChange('sepal_width', e.target.value)}
                      className="w-full mt-2 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Pétalas */}
              <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                    Dimensões da Pétala (Petal)
                  </span>
                  <span className="text-[11px] text-slate-400">Principal diferencial das espécies</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Petal Length */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="petal_length" className="text-xs font-semibold text-slate-700">
                        Petal Length (Comprimento)
                      </label>
                      <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60">
                        {formData.petal_length || '0'} cm
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="12.0"
                      required
                      id="petal_length"
                      name="petal_length"
                      value={formData.petal_length}
                      onChange={handleChange}
                      placeholder="Ex: 5.2"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 outline-none transition-all shadow-2xs"
                    />
                    <input
                      type="range"
                      min="1.0"
                      max="7.0"
                      step="0.1"
                      value={formData.petal_length || 4.5}
                      onChange={(e) => handleSliderChange('petal_length', e.target.value)}
                      className="w-full mt-2 accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Petal Width */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="petal_width" className="text-xs font-semibold text-slate-700">
                        Petal Width (Largura)
                      </label>
                      <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200/60">
                        {formData.petal_width || '0'} cm
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10.0"
                      required
                      id="petal_width"
                      name="petal_width"
                      value={formData.petal_width}
                      onChange={handleChange}
                      placeholder="Ex: 2.3"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 outline-none transition-all shadow-2xs"
                    />
                    <input
                      type="range"
                      min="0.1"
                      max="2.6"
                      step="0.1"
                      value={formData.petal_width || 1.4}
                      onChange={(e) => handleSliderChange('petal_width', e.target.value)}
                      className="w-full mt-2 accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-violet-200/80 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Consultando Modelo de IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Executar Predição na API</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Restaurar</span>
                </button>
              </div>
            </form>
          </section>

          {/* Coluna 2: Resultado em Destaque & Abas de Análise (5 colunas) */}
          <section className="lg:col-span-5 space-y-6">
            {/* Card Principal: Predição em Destaque */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-violet-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Resultado da Classificação
                  </h3>
                </div>

                {result && (
                  <button
                    type="button"
                    onClick={copyResultJSON}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Copiar JSON de resposta"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="font-mono text-[11px]">{copied ? 'Copiado!' : 'JSON'}</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-14 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin"></div>
                    <Flower2 className="w-6 h-6 text-violet-600 absolute inset-0 m-auto" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Processando na API Flask...</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Enviando vetor de características morfológicas para classificação
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-5">
                  {/* Banner Destaque da Espécie */}
                  <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 rounded-2xl p-6 text-center relative overflow-hidden shadow-2xs">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                      Espécie Identificada
                    </span>

                    <div className="my-2">
                      <div
                        className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 shadow-xs transition-transform transform hover:scale-102 ${speciesDetails.badgeBg} ${speciesDetails.badgeText} ${speciesDetails.badgeBorder}`}
                      >
                        <Flower2 className="w-7 h-7 flex-shrink-0 animate-pulse" />
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
                          {result.predicao}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-600 mt-3 max-w-sm mx-auto">
                      {speciesDetails.subtitle}
                    </p>

                    {result.codigo !== undefined && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200">
                        <span>Código do Modelo:</span>
                        <span className="font-bold text-violet-700">#{result.codigo}</span>
                      </div>
                    )}
                  </div>

                  {/* Resumo de Dados Processados pela API */}
                  {result.dados_recebidos && (
                    <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200/70 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="uppercase tracking-wider">Dados Processados no Backend</span>
                        <span className="font-mono text-[11px] text-slate-400">status: 200 OK</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 flex justify-between items-center">
                          <span className="text-slate-500">Sepal Length</span>
                          <span className="font-bold text-slate-800">{result.dados_recebidos.sepal_length} cm</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 flex justify-between items-center">
                          <span className="text-slate-500">Sepal Width</span>
                          <span className="font-bold text-slate-800">{result.dados_recebidos.sepal_width} cm</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 flex justify-between items-center">
                          <span className="text-slate-500">Petal Length</span>
                          <span className="font-bold text-slate-800">{result.dados_recebidos.petal_length} cm</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/70 flex justify-between items-center">
                          <span className="text-slate-500">Petal Width</span>
                          <span className="font-bold text-slate-800">{result.dados_recebidos.petal_width} cm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informações biológicas adicionais */}
                  <div className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 text-xs text-slate-600 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed">
                      {speciesDetails.description}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Painel de Análise: Diagrama Morfológico ou Tabela do Dataset */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('visual')}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'visual'
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    Visualizador Morfológico
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dataset')}
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'dataset'
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    Médias do Dataset
                  </button>
                </div>
              </div>

              {activeTab === 'visual' ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Comparação proporcional dinâmica entre a sépala e a pétala baseada nas medidas atuais:
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {/* Visual Sépala */}
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-slate-600 mb-2">Sépala (SL × SW)</span>
                      <div className="h-32 w-full flex items-center justify-center bg-white rounded-lg border border-slate-200 p-2">
                        <div
                          className="bg-indigo-200 border-2 border-indigo-500 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xs"
                          style={{
                            height: `${Math.min(Math.max(numSL * 14, 30), 110)}px`,
                            width: `${Math.min(Math.max(numSW * 16, 20), 80)}px`,
                          }}
                        >
                          <span className="text-[10px] font-bold text-indigo-900 font-mono">
                            {numSL}×{numSW}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono">Área aprox: {(numSL * numSW).toFixed(1)} cm²</span>
                    </div>

                    {/* Visual Pétala */}
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-slate-600 mb-2">Pétala (PL × PW)</span>
                      <div className="h-32 w-full flex items-center justify-center bg-white rounded-lg border border-slate-200 p-2">
                        <div
                          className="bg-violet-200 border-2 border-violet-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xs"
                          style={{
                            height: `${Math.min(Math.max(numPL * 14, 20), 110)}px`,
                            width: `${Math.min(Math.max(numPW * 22, 14), 70)}px`,
                          }}
                        >
                          <span className="text-[10px] font-bold text-violet-900 font-mono">
                            {numPL}×{numPW}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono">Área aprox: {(numPL * numPW).toFixed(1)} cm²</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span>Razão Comprimento Pétala / Sépala:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(numPL / (numSL || 1)).toFixed(2)}x
                    </span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-mono">
                        <th className="pb-2">Espécie</th>
                        <th className="pb-2">Sepal L.</th>
                        <th className="pb-2">Sepal W.</th>
                        <th className="pb-2">Petal L.</th>
                        <th className="pb-2">Petal W.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr className={result?.predicao?.toLowerCase() === 'setosa' ? 'bg-emerald-50/80 font-bold' : ''}>
                        <td className="py-2 text-emerald-800">Setosa</td>
                        <td className="py-2">5.0 cm</td>
                        <td className="py-2">3.4 cm</td>
                        <td className="py-2">1.5 cm</td>
                        <td className="py-2">0.2 cm</td>
                      </tr>
                      <tr className={result?.predicao?.toLowerCase() === 'versicolor' ? 'bg-sky-50/80 font-bold' : ''}>
                        <td className="py-2 text-sky-800">Versicolor</td>
                        <td className="py-2">5.9 cm</td>
                        <td className="py-2">2.8 cm</td>
                        <td className="py-2">4.3 cm</td>
                        <td className="py-2">1.3 cm</td>
                      </tr>
                      <tr className={result?.predicao?.toLowerCase() === 'virginica' ? 'bg-purple-50/80 font-bold' : ''}>
                        <td className="py-2 text-purple-800">Virginica</td>
                        <td className="py-2">6.6 cm</td>
                        <td className="py-2">3.0 cm</td>
                        <td className="py-2">5.5 cm</td>
                        <td className="py-2">2.0 cm</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[10px] text-slate-400 mt-3 italic">
                    * Médias canônicas do conjunto de dados de Ronald Fisher (1936).
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Histórico Recente de Previsões */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Histórico de Previsões da Sessão</h3>
                <p className="text-xs text-slate-500">Últimas classificações computadas</p>
              </div>
            </div>

            {history.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportHistoryJSON}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar JSON
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhuma predição no histórico ainda. Execute o formulário para registrar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-mono">
                    <th className="pb-2.5">Horário</th>
                    <th className="pb-2.5">Espécie Prevista</th>
                    <th className="pb-2.5">Código</th>
                    <th className="pb-2.5">Medidas (SL / SW / PL / PW)</th>
                    <th className="pb-2.5">Latência</th>
                    <th className="pb-2.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => {
                    const badge = item.predicao.toLowerCase().includes('virginica')
                      ? 'bg-purple-100 text-purple-800'
                      : item.predicao.toLowerCase().includes('setosa')
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-100 text-sky-800';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 font-mono text-slate-500">{item.timestamp}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${badge}`}>
                            {item.predicao}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-slate-600">
                          {item.codigo !== undefined ? `#${item.codigo}` : '—'}
                        </td>
                        <td className="py-3 font-mono text-slate-700">
                          {item.dados.sepal_length} / {item.dados.sepal_width} / {item.dados.petal_length} / {item.dados.petal_width} cm
                        </td>
                        <td className="py-3 font-mono text-slate-400">
                          {item.latencyMs ? `${item.latencyMs}ms` : '—'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                sepal_length: item.dados.sepal_length.toString(),
                                sepal_width: item.dados.sepal_width.toString(),
                                petal_length: item.dados.petal_length.toString(),
                                petal_width: item.dados.petal_width.toString(),
                              });
                            }}
                            className="text-violet-600 hover:text-violet-800 font-semibold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            Carregar <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600"></span>
            <span className="font-semibold text-slate-700">Iris Species Classification Dashboard</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">ML Model via Flask REST API</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>React 19 + Vite 8</span>
            <span>&bull;</span>
            <span>Tailwind CSS</span>
            <span>&bull;</span>
            <span className="text-slate-600 font-medium">Pronto para Deploy na Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
