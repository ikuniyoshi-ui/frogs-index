
import React, { useState, useMemo } from 'react';
import { RAW_QUESTION_DATA, SCORE_LABELS } from './constants';
import { ScoreLabel, DiagnosticResult } from './types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { 
  ChevronRight, ClipboardCheck, Download, RefreshCw, BarChart3, 
  ShieldCheck, Zap, Target, Loader2, Briefcase, Award, FileText, CheckCircle2,
  // Fix: Added missing UserCheck icon import
  UserCheck
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Header Component
 */
const Header = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BarChart3 className="text-white w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg text-slate-800 tracking-tight">FROGS Index</h1>
      </div>
      <div className="text-xs text-slate-500 font-medium hidden sm:block">
        Entrepreneurship Potential Dashboard
      </div>
    </div>
  </header>
);

/**
 * Career Position Recommendation Section
 */
const RecommendationSection = ({ scores }: { scores: Record<string, number> }) => {
  const getTopRoles = () => {
    const roles = [
      {
        name: "経営者・起業家",
        desc: "高いリスクテイク能力とビジョンを描く力があります。不確実な状況でも決断を下し、ゼロからイチを生み出すポジションに向いています。",
        icon: <Award className="w-5 h-5 text-amber-500" />,
        logic: (scores["アントレプレナーシップ"] || 0) * 1.5 + (scores["自信"] || 0) + (scores["行動力・チャレンジ"] || 0)
      },
      {
        name: "新規事業開発・営業",
        desc: "高い対人能力と行動力で市場を切り拓く力があります。顧客との信頼関係を築き、プロダクトの価値を最大化させる役割で輝きます。",
        icon: <Zap className="w-5 h-5 text-indigo-500" />,
        logic: (scores["対人関係スキル・コミュニケーション能力"] || 0) + (scores["行動力・チャレンジ"] || 0) + (scores["等身大・表現力"] || 0)
      },
      {
        name: "プロジェクトマネージャー",
        desc: "リーダーシップと粘り強さを活かし、チームを目標達成へと導く司令塔です。複雑な状況を整理し、着実に実行へ移す適性があります。",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        logic: (scores["リーダーシップ・自己主体性"] || 0) + (scores["自己主体性・問題解決能力"] || 0) + (scores["行動継続力"] || 0)
      },
      {
        name: "戦略コンサルタント・企画",
        desc: "卓越した思考力と問題解決能力で、組織の課題を打破します。データを分析し、論理的な裏付けを持って最適解を提示するポジションが最適です。",
        icon: <Target className="w-5 h-5 text-rose-500" />,
        logic: (scores["素直・思考力"] || 0) + (scores["自己主体性・問題解決能力"] || 0) + (scores["等身大・表現力"] || 0)
      },
      {
        name: "人事・組織開発・広報",
        desc: "共感力と表現力が高く、人の可能性を引き出し組織のファンを増やす力があります。文化を創り、想いを言語化して伝える役割に向いています。",
        icon: <UserCheck className="w-5 h-5 text-sky-500" />,
        logic: (scores["対人関係スキル・コミュニケーション能力"] || 0) + (scores["素直・思考力"] || 0) + (scores["等身大・表現力"] || 0)
      }
    ];
    return roles.sort((a, b) => b.logic - a.logic).slice(0, 2);
  };

  const topRoles = getTopRoles();

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mt-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Briefcase className="text-indigo-600 w-6 h-6" />
        キャリア適性アドバイス
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topRoles.map((role, idx) => (
          <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">{role.icon}</div>
              <span className="font-bold text-slate-800 text-lg">{role.name}</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{role.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Strength and Growth Analysis Section
 */
const AnalysisSection = ({ scores }: { scores: Record<string, number> }) => {
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strengths = sortedScores.slice(0, 3);
  const growthAreas = sortedScores.slice(-2);

  const getAdvice = (category: string) => {
    const adviceMap: Record<string, string> = {
      "自信": "自分の可能性を信じる力があります。周囲の顔色を伺わず、自分の直感に従って大きな挑戦に踏み出す準備ができています。成功体験を言語化して他者に共有することで、より強固な自信へ繋がります。",
      "リーダーシップ・自己主体性": "周囲を巻き込み、主体的に動く素養が非常に高いです。今は自分でやりすぎるよりも、メンバーの強みを見抜き「任せる技術」を磨くことで、組織全体の成果を最大化できます。",
      "素直・思考力": "複雑な事象を整理し、本質を見抜く力に長けています。論理だけでなく、自分の感情や他者の想いといった「非言語情報」も意識的に取り入れると、より深みのある意思決定が可能になります。",
      "自己主体性・問題解決能力": "社会的な視点を持ち、自分事として課題を捉えられています。素晴らしい発想力を形にするために、小さな「プロトタイプ」を作り、いち早く市場からのフィードバックを得る癖をつけましょう。",
      "対人関係スキル・コミュニケーション能力": "高い共感力と調整能力を持っています。調和を重んじるあまり、自分の本音を抑え込んでいないか時々振り返ってください。時には「良い衝突」を恐れず意見をぶつけ合うことも大切です。",
      "アントレプレナーシップ": "変化を楽しみ、既存の枠組みに疑問を持つ姿勢があります。独自の視点は貴重な資産です。孤立を恐れず、同じ志を持つコミュニティに身を置き、思考をアップデートし続けてください。",
      "諦めない力・変化対応力": "粘り強さと柔軟性を兼ね備えています。困難を「成長の種」と捉えるマインドセットは最強の武器です。燃え尽きないよう戦略的に休息を取り、長期戦に備える視点も持ちましょう。",
      "行動継続力": "地道な努力と改善を積み重ねる才能があります。一定の成果が出たあとに、さらに高い視座（ネクストレベル）を設定することで、その継続力は社会を動かす大きな力に変わります。",
      "行動力・チャレンジ": "リスクを恐れず第一歩を踏み出せる力があります。その瞬発力を活かしつつ、行動の後に得られた結果をデータとして冷静に分析する習慣を持つと、成功確率が飛みに高まります。",
      "等身大・表現力": "ありのままの自分を表現し、想いを伝える力があります。あなたの言葉には信頼感があります。共感を得るための「ストーリーテリング」の手法を学ぶと、より多くの協力者が集まるはずです。"
    };
    return adviceMap[category] || "この項目をさらに伸ばすには、日々の行動に意識的に取り入れ、小さな成功を積み重ねることが近道です。";
  };

  return (
    <div className="space-y-8 mt-12">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Zap className="text-amber-500 w-6 h-6" />
          現在の強み (Strength)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strengths.map(([category, score]) => (
            <div key={category} className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500 shadow-sm">
              <div className="text-indigo-600 font-bold mb-2 text-sm uppercase tracking-wider">{category}</div>
              <p className="text-slate-600 text-xs leading-relaxed">{getAdvice(category)}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Target className="text-rose-500 w-6 h-6" />
          今後の成長課題 (Growth Area)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {growthAreas.map(([category, score]) => (
            <div key={category} className="bg-white p-6 rounded-2xl border-t-4 border-slate-300 shadow-sm">
              <div className="text-slate-700 font-bold mb-2 text-sm uppercase tracking-wider">{category}</div>
              <p className="text-slate-500 text-xs leading-relaxed">
                この項目は現在伸び代が非常に大きいポイントです。{getAdvice(category)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'intro' | 'form' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<string, ScoreLabel>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const totalQuestions = useMemo(() => {
    return Object.values(RAW_QUESTION_DATA).reduce((acc: number, qs) => acc + qs.length, 0);
  }, []);

  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  const handleAnswer = (qId: string, label: ScoreLabel) => {
    setAnswers(prev => ({ ...prev, [qId]: label }));
  };

  const calculateResult = (): DiagnosticResult => {
    const categoryScores: Record<string, number> = {};
    let totalScore = 0;

    Object.entries(RAW_QUESTION_DATA).forEach(([category, questions]) => {
      let catSum = 0;
      questions.forEach((q, idx) => {
        const qId = `${category}-${idx}`;
        const label = answers[qId];
        if (label) {
          const score = (q.scores[label] as number) || 0;
          catSum += score;
        }
      });
      categoryScores[category] = catSum;
      totalScore += catSum;
    });

    return {
      userId: 'user_' + Math.random().toString(36).substring(2, 8),
      timestamp: Date.now(),
      categoryScores,
      totalScore
    };
  };

  const result = useMemo(() => {
    if (view !== 'result') return null;
    return calculateResult();
  }, [view, answers]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < totalQuestions) {
      alert(`まだ全ての質問に回答していません。（${Object.keys(answers).length} / ${totalQuestions}）`);
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setView('result');
      window.scrollTo(0, 0);
    }, 1200);
  };

  const handleExportPdf = async () => {
    const element = document.getElementById('result-report');
    if (!element) return;

    setIsGeneratingPdf(true);
    // Add print class for styles
    element.classList.add('pdf-rendering');

    try {
      // Small delay for rendering
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.height / imgProps.width;
      const actualImgHeight = pdfWidth * ratio;

      let heightLeft = actualImgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, actualImgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - actualImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, actualImgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`FROGS_Index_Diagnostic_Report.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('PDFの作成に失敗しました。お使いのブラウザが最新かご確認ください。');
    } finally {
      element.classList.remove('pdf-rendering');
      setIsGeneratingPdf(false);
    }
  };

  if (view === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-slate-100">
        <div className="max-w-xl w-full text-center space-y-8 bg-white p-12 rounded-3xl shadow-2xl border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16" />
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <BarChart3 className="text-white w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">
              FROGS Index
            </h1>
            <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full" />
            <p className="text-slate-600 leading-relaxed font-medium text-lg">
              10の非認知能力を分析し、最適なポジションを見つけ出します。
            </p>
          </div>
          <button 
            onClick={() => setView('form')}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-100 active:scale-95"
          >
            診断を開始する
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 匿名診断</span>
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF保存可能</span>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result' && result) {
    const chartData = Object.entries(result.categoryScores).map(([subject, value]) => ({
      subject,
      value: value as number,
      fullMark: 25,
    }));

    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-12">
          {/* Report Capture Area */}
          <div id="result-report" className="space-y-10 bg-white p-10 md:p-14 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">FROGS Index 診断レポート</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Entrepreneurship Tendency Dashboard</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 font-bold uppercase">ID: {result.userId}</div>
                <div className="text-xs text-slate-400">{new Date(result.timestamp).toLocaleDateString()}</div>
              </div>
            </div>

            <section className="bg-indigo-600 rounded-[2rem] shadow-2xl p-10 text-center text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-4 opacity-70">総合スコア (Total Score)</h2>
              <div className="flex flex-col items-center justify-center">
                <span className="text-9xl font-black tracking-tighter tabular-nums">{result.totalScore}</span>
                <span className="font-black mt-2 opacity-60 uppercase text-xs tracking-widest">/ 250 Points</span>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <section className="lg:col-span-3 flex flex-col items-center">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 w-full text-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  資質特性傾向
                </h3>
                <div className="w-full aspect-square max-h-[420px] bg-slate-50/50 rounded-3xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} 
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 25]} tick={false} axisLine={false} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fill="#4f46e5"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="lg:col-span-2">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                  <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                  各項目の詳細数値
                </h3>
                <div className="space-y-5">
                  {Object.entries(result.categoryScores).map(([name, score]) => (
                    <div key={name} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600">{name}</span>
                        <span className="text-indigo-600 text-sm">{score}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${((score as number) / 25) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <RecommendationSection scores={result.categoryScores} />
            <AnalysisSection scores={result.categoryScores} />
            
            <div className="text-center pt-12 border-t border-slate-100">
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em]">FROGS Index Performance Analysis Report</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto no-print">
            <button 
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 active:scale-95"
            >
              {isGeneratingPdf ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
              {isGeneratingPdf ? 'レポートを生成中...' : '診断レポートをPDF保存'}
            </button>
            <button 
              onClick={() => { setAnswers({}); setView('intro'); }}
              className="flex-1 py-5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              最初から診断をやり直す
            </button>
          </div>
        </main>

        <style>{`
          @media print { .no-print { display: none !important; } }
          .pdf-rendering .no-print { display: none !important; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Header />
      
      {/* Dynamic Progress Indicator */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-2 w-full">
          <div className="bg-slate-100 h-full w-full rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Diagnostic in progress...</span>
          <span className="text-indigo-600 font-black">{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-12 text-center space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">FROGS Index</h2>
          <p className="text-slate-500 text-sm font-medium">あまり深く考えず、直感で今の自分に近いものを選択してください。</p>
        </div>

        {Object.entries(RAW_QUESTION_DATA).map(([category, questions]) => (
          <div key={category} className="mb-12">
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const qId = `${category}-${idx}`;
                const currentAnswer = answers[qId];
                
                return (
                  <div key={qId} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex gap-4 mb-6">
                      <span className="text-indigo-200 font-black text-2xl italic leading-none">0{idx + 1}</span>
                      <p className="text-slate-800 font-bold leading-relaxed text-lg">
                        {q.text}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {SCORE_LABELS.map((label) => (
                        <label 
                          key={label}
                          className={`
                            flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer text-[10px] font-black transition-all text-center leading-tight h-16
                            ${currentAnswer === label 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                              : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/30'}
                          `}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            onChange={() => handleAnswer(qId, label)}
                            checked={currentAnswer === label}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-20 bg-slate-900 rounded-[2.5rem] p-12 text-white text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-30 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-8">
            <h3 className="text-3xl font-black tracking-tight">回答を完了しました</h3>
            <p className="text-slate-400 text-sm font-medium max-w-md mx-auto leading-relaxed">
              全ての設問に対する回答が集計されました。<br />あなたの傾向と適性ポジションを詳しく分析します。
            </p>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-2xl 
                hover:bg-indigo-500 transition-all flex items-center justify-center gap-3
                active:scale-95 shadow-2xl shadow-indigo-900/40
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  集計分析中...
                </>
              ) : (
                <>
                  分析結果を確認する
                  <ChevronRight className="w-8 h-8" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Floating Counter for Mobile */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[280px] px-4 sm:hidden pointer-events-none z-50">
        <div className="bg-slate-900/90 backdrop-blur-md shadow-2xl text-white py-4 px-8 rounded-full text-center text-[10px] font-black tracking-[0.2em] border border-white/10">
          PROCESSED: {Object.keys(answers).length} / {totalQuestions}
        </div>
      </div>
    </div>
  );
}
