import { useEffect, useMemo, useRef, useState } from "react";
import {
  captureRows,
  documentModules,
  enterpriseModules,
  integrationRows,
  navItems,
} from "./data";

type SectionNode = {
  id?: string;
  className?: string;
  content: JSX.Element;
  children?: SectionNode[];
};

const WHATSAPP_NUMBER = "5549991850177";
const BASE_WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
const DEFAULT_WHATSAPP_MESSAGE =
  "Olá! Tenho interesse nas soluções de automação + IA da Atlas.Automate e gostaria de entender a melhor opção para o meu negócio.";

const formatDate = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

const buildWhatsappLink = (message?: string) => {
  if (!message) return BASE_WHATSAPP_LINK;
  return `${BASE_WHATSAPP_LINK}?text=${encodeURIComponent(message)}`;
};

const estimateHoursLabel = (price: string) => {
  const matches = Array.from(price.matchAll(/(\d+(?:[.,]\d+)?)k/gi)).map((match) =>
    Number(match[1].replace(",", "."))
  );

  if (!matches.length) return "Sob análise";

  const hourlyRate = 200;
  const convertToHours = (valueInThousands: number) =>
    Math.round((valueInThousands * 1000) / hourlyRate);

  if (matches.length === 1) {
    return `≈ ${convertToHours(matches[0])}h`;
  }

  return `≈ ${convertToHours(matches[0])}h a ${convertToHours(matches[1])}h`;
};

const ScheduleButton = ({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className: string;
  children: JSX.Element | string;
}) => (
  <button type="button" onClick={onClick} className={className}>
    {children}
  </button>
);

const WhatsAppButton = ({
  label,
  className,
}: {
  label: string;
  className: string;
}) => (
  <a
    href={buildWhatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
    className={className}
    target="_blank"
    rel="noreferrer"
  >
    <i className="fa-brands fa-whatsapp text-[#22C55E]"></i> {label}
  </a>
);

const SectionRenderer = ({ section }: { section: SectionNode }) => (
  <section
    id={section.id}
    className={["section-shell", "section-fullscreen", section.className].filter(Boolean).join(" ")}
  >
    {section.content}
    {section.children?.map((child, index) => (
      <SectionRenderer key={child.id ?? index} section={child} />
    ))}
  </section>
);

const ScheduleModal = ({
  isOpen,
  selectedDate,
  onClose,
  onDateChange,
  onConfirm,
}: {
  isOpen: boolean;
  selectedDate: string;
  onClose: () => void;
  onDateChange: (value: string) => void;
  onConfirm: () => void;
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !dateInputRef.current) return;

    const input = dateInputRef.current;
    input.focus();
    if ("showPicker" in input) {
      input.showPicker();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1e1e1e] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-xl font-bold text-white">
            Escolha a data
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Fechar modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-400">
          Clique em "Abrir calendário", selecione a data e confirme para abrir o
          WhatsApp com a mensagem pronta incluindo o dia escolhido.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:bg-white/10"
          >
            <i className="fa-solid fa-calendar-days"></i> Abrir calendário
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-white focus:border-[#7C3AED] focus:outline-none"
          />
          {selectedDate && (
            <p className="text-xs text-gray-300">
              Mensagem pronta: "Olá! Tenho interesse nas soluções de automação + IA da Atlas.Automate.
              Gostaria de agendar uma demonstração para {formatDate(selectedDate)}."
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedDate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fa-solid fa-calendar-check"></i> Confirmar e abrir
            WhatsApp
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(navItems[0]?.href.replace("#", "") ?? "hero");

  const sections = useMemo<SectionNode[]>(
    () => [
      {
        id: "hero",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <div className="shape-hero-1"></div>
            <div className="shape-hero-2"></div>
            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-hero"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-hero)"></rect>
            </svg>

            <div className="relative z-10 mx-auto flex min-h-[80vh] md:min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center px-4 py-10 sm:px-6 md:py-14">
              <div className="grid w-full grid-cols-1 items-center gap-10 text-center md:grid-cols-12 md:text-left">
                <div className="flex flex-col items-center gap-6 md:col-span-7 md:items-start">
                  <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#7C3AED]/50 bg-[#4C1D95]/30 px-4 py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#A78BFA]"></span>
                    <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-[#A78BFA]">
                      Soluções Enterprise
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <h1 className="font-montserrat text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
                      Automação + IA <br />
                      <span className="text-[#A78BFA]">Sob Medida</span>
                    </h1>
                    <h2 className="font-montserrat mt-2 text-2xl font-semibold text-gray-300 sm:text-3xl md:text-4xl">
                      para Seu Negócio
                    </h2>
                  </div>

                  <p className="mt-1 max-w-2xl border-l-4 border-[#7C3AED] pl-6 text-lg leading-relaxed text-gray-300 sm:text-xl md:text-left">
                    Transformamos processos manuais repetitivos em fluxos digitais
                    inteligentes, auditáveis e escaláveis. Do WhatsApp ao ERP, em
                    minutos.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                    <ScheduleButton
                      onClick={() => setIsScheduleOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-3 font-semibold text-white transition hover:opacity-90"
                    >
                      <>
                        <i className="fa-solid fa-calendar-check"></i> Agendar
                        demonstração
                      </>
                    </ScheduleButton>
                    <WhatsAppButton
                      label="Falar no WhatsApp"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-gray-100 transition hover:bg-white/15"
                    />
                  </div>

                  <div className="mt-6 grid w-full grid-cols-1 gap-4 text-center sm:grid-cols-3 md:text-left">
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-[#7C3AED]">
                        <i className="fa-solid fa-check-circle mr-2"></i>Sem
                        erros
                      </span>
                      <span className="text-sm text-gray-400">
                        Elimine falhas humanas
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-[#7C3AED]">
                        <i className="fa-solid fa-bolt mr-2"></i>Rápido
                      </span>
                      <span className="text-sm text-gray-400">
                        De horas para minutos
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-[#7C3AED]">
                        <i className="fa-solid fa-magnifying-glass-chart mr-2"></i>
                        Auditável
                      </span>
                      <span className="text-sm text-gray-400">
                        Rastreabilidade total
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center md:col-span-5 md:justify-end">
                  <div className="relative h-[320px] w-[320px] sm:h-[380px] sm:w-[380px] md:h-[450px] md:w-[450px]">
                    <div className="absolute left-1/2 top-1/2 z-20 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7C3AED] bg-[#2B0A3D] shadow-[0_0_50px_rgba(124,58,237,0.3)] sm:h-48 sm:w-48">
                      <div className="flex h-full w-full items-center justify-center">
                        <i className="fa-solid fa-brain text-5xl text-[#A78BFA] sm:text-6xl"></i>
                      </div>
                    </div>
                    <div className="absolute left-1/2 top-0 z-10 h-20 w-20 -translate-x-1/2 -translate-y-2 rounded-xl border border-gray-700 bg-[#1e1e1e] shadow-lg">
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <i className="fa-solid fa-file-pdf mb-1 text-2xl text-[#EF4444]"></i>
                        <span className="text-[10px] text-gray-400">INPUT</span>
                      </div>
                    </div>
                    <div className="absolute right-0 top-1/2 z-10 h-20 w-20 -translate-y-1/2 translate-x-2 rounded-xl border border-gray-700 bg-[#1e1e1e] shadow-lg">
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <i className="fa-brands fa-whatsapp mb-1 text-2xl text-[#22C55E]"></i>
                        <span className="text-[10px] text-gray-400">
                          CHANNEL
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 z-10 h-20 w-20 -translate-x-1/2 translate-y-2 rounded-xl border border-gray-700 bg-[#1e1e1e] shadow-lg">
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <i className="fa-solid fa-database mb-1 text-2xl text-[#3B82F6]"></i>
                        <span className="text-[10px] text-gray-400">ERP</span>
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/2 z-10 h-20 w-20 -translate-x-2 -translate-y-1/2 rounded-xl border border-gray-700 bg-[#1e1e1e] shadow-lg">
                      <div className="flex h-full w-full flex-col items-center justify-center">
                        <i className="fa-solid fa-bell mb-1 text-2xl text-[#F59E0B]"></i>
                        <span className="text-[10px] text-gray-400">ALERT</span>
                      </div>
                    </div>
                    <div className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10"></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        id: "problema",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <div
              className="shape-a"
              style={{ width: 420, height: 420, opacity: 0.1, background: "#7C3AED" }}
            ></div>
            <div
              className="shape-b"
              style={{
                width: 520,
                height: 520,
                opacity: 0.2,
                background: "#4C1D95",
                left: -170,
                bottom: -170,
              }}
            ></div>

            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-problema"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-problema)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="mb-12 text-center">
                <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                  O problema das operações manuais
                </h2>
                <p className="mt-3 text-sm text-gray-400">
                  Falta de controle, erros e retrabalho criam um ciclo caro que
                  trava o crescimento.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[
                  {
                    title: "Erros humanos",
                    text: "Informações digitadas de forma inconsistente geram retrabalho e perda de confiança.",
                    icon: "fa-triangle-exclamation",
                    color: "text-[#F59E0B]",
                  },
                  {
                    title: "Baixa visibilidade",
                    text: "Sem rastreabilidade, o gestor não sabe onde o processo parou ou quem aprovou.",
                    icon: "fa-eye-slash",
                    color: "text-[#60A5FA]",
                  },
                  {
                    title: "Escala bloqueada",
                    text: "A equipe cresce, mas o volume cresce mais rápido. O gargalo vira custo fixo.",
                    icon: "fa-chart-line",
                    color: "text-[#A78BFA]",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="glass rounded-2xl border border-white/10 p-6"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e1e1e]">
                      <i className={`fa-solid ${card.icon} ${card.color}`}></i>
                    </div>
                    <h3 className="font-montserrat text-lg font-bold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ),
      },
      {
        id: "valor",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <div
              className="shape-a"
              style={{ top: "-8%", left: "-6%", right: "auto" }}
            ></div>
            <div
              className="shape-b"
              style={{ bottom: "-10%", right: "-6%", left: "auto", background: "#7C3AED", opacity: 0.12 }}
            ></div>

            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-valor"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-valor)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                    O que entregamos
                  </h2>
                  <p className="mt-3 text-sm text-gray-400">
                    Automação com inteligência aplicada, com SLA e controle de
                    ponta a ponta.
                  </p>

                  <div className="mt-6 space-y-4">
                    {["Automação auditável", "Integração rápida", "Escala segura"].map(
                      (item) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED]/20 text-[#A78BFA]">
                            <i className="fa-solid fa-check"></i>
                          </span>
                          <div>
                            <p className="m-0 text-white">{item}</p>
                            <p className="m-0 text-xs text-gray-400">
                              Projetado para operações críticas.
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      {
                        title: "-42%",
                        subtitle: "Redução de custo operacional",
                        icon: "fa-chart-line",
                      },
                      {
                        title: "+3x",
                        subtitle: "Velocidade de processamento",
                        icon: "fa-bolt",
                      },
                      {
                        title: "99,9%",
                        subtitle: "Precisão em dados críticos",
                        icon: "fa-bullseye",
                      },
                      {
                        title: "24/7",
                        subtitle: "Monitoramento ativo",
                        icon: "fa-robot",
                      },
                    ].map((kpi) => (
                      <div key={kpi.title} className="kpi-card rounded-2xl p-6">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2B0A3D]">
                          <i className={`fa-solid ${kpi.icon} text-[#A78BFA]`}></i>
                        </div>
                        <p className="font-montserrat text-2xl font-extrabold text-white">
                          {kpi.title}
                        </p>
                        <p className="text-sm text-gray-400">{kpi.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        id: "resultados",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid-resultados" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-resultados)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 md:py-14">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                  Resultados reais para operações reais
                </h2>
                <p className="mt-3 text-sm text-gray-400 sm:text-base">
                  Projetos desenhados para reduzir esforço manual, aumentar previsibilidade e acelerar o crescimento com segurança.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { value: "-58%", label: "menos retrabalho" },
                  { value: "+2.7x", label: "mais produtividade" },
                  { value: "< 90 dias", label: "time-to-value médio" },
                  { value: "NPS 9.2", label: "satisfação de operações" },
                ].map((item) => (
                  <div key={item.label} className="result-card rounded-2xl p-6">
                    <p className="font-montserrat text-3xl font-extrabold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ),
      },
      {
        id: "fluxo",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-fluxo"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-fluxo)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="mb-10 text-center">
                <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                  Fluxo de entrega
                </h2>
                <p className="mt-3 text-sm text-gray-400">
                  Um processo que garante velocidade sem perder governança.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {["Diagnóstico", "Construção", "Operação"].map((step, index) => (
                  <div key={step} className="relative flow-card rounded-2xl p-6">
                    <span className="step-badge">{index + 1}</span>
                    <h3 className="font-montserrat text-lg font-bold text-white">
                      {step}
                    </h3>
                    <p className="mt-3 text-sm text-gray-400">
                      {step === "Diagnóstico"
                        ? "Mapeamos processos, riscos e metas para priorizar o impacto."
                        : step === "Construção"
                          ? "Desenhamos e implementamos o fluxo com integrações seguras."
                          : "Monitoramos, evoluímos e garantimos SLA contínuo."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ),
      },
      {
        id: "metodologia",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-metodo"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-metodo)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="mb-10 text-center">
                <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                  Metodologia Atlas.Automate
                </h2>
                <p className="mt-3 text-sm text-gray-400">
                  Deploy rápido, controle total e evolução contínua.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {["Descobrir", "Construir", "Escalar"].map((item, index) => (
                  <div key={item} className="method-card rounded-2xl p-6">
                    <div
                      className="step-circle mb-4"
                      style={{ borderColor: "#7C3AED" }}
                    >
                      <span className="text-[#A78BFA]">{index + 1}</span>
                    </div>
                    <h3 className="font-montserrat text-lg font-bold text-white">
                      {item}
                    </h3>
                    <p className="mt-3 text-sm text-gray-400">
                      {item === "Descobrir"
                        ? "Imersão no processo e desenho do ROI."
                        : item === "Construir"
                          ? "Integrações, IA e regras de negócio em semanas."
                          : "Automação monitorada e evolutiva com SLA."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ),
      },
      {
        content: <></>,
        children: [
          {
            id: "catalogo-entradas",
            className: "relative overflow-hidden bg-[#2B0A3D]",
            content: (
              <>
                <div className="shape-a" style={{ left: -120, right: "auto" }}></div>
                <div
                  className="shape-b"
                  style={{ right: -170, left: "auto", background: "#7C3AED", opacity: 0.12 }}
                ></div>

                <svg
                  className="absolute inset-0 z-0 h-full w-full opacity-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid-catalogo-1"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                      ></path>
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#grid-catalogo-1)"
                  ></rect>
                </svg>

                <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
                  <div className="mb-8">
                    <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                      Catálogo de entradas
                    </h2>
                    <p className="text-sm text-gray-400">
                      Onde a informação chega para iniciar o fluxo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {["E-mail", "Formulários", "WhatsApp"].map((item) => (
                      <div key={item} className="catalog-card rounded-2xl p-6">
                        <h3 className="font-montserrat text-lg font-bold text-white">
                          {item}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">
                          Recepção estruturada com validação e pré-tratamento.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ),
          },
          {
            id: "catalogo-processamento",
            className: "relative overflow-hidden bg-[#2B0A3D]",
            content: (
              <>
                <div className="shape-a" style={{ left: -120, right: "auto" }}></div>
                <div
                  className="shape-b"
                  style={{ right: -170, left: "auto", background: "#7C3AED", opacity: 0.12 }}
                ></div>

                <svg
                  className="absolute inset-0 z-0 h-full w-full opacity-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid-catalogo-2"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                      ></path>
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#grid-catalogo-2)"
                  ></rect>
                </svg>

                <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
                  <div className="mb-8">
                    <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                      Catálogo de processamento
                    </h2>
                    <p className="text-sm text-gray-400">
                      Transformamos dados com regras de negócio e IA.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {["Classificação", "Extração", "Validação"].map((item) => (
                      <div key={item} className="catalog-card rounded-2xl p-6">
                        <h3 className="font-montserrat text-lg font-bold text-white">
                          {item}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">
                          Automação inteligente com trilha de auditoria.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ),
          },
          {
            id: "catalogo-saidas",
            className: "relative overflow-hidden bg-[#2B0A3D]",
            content: (
              <>
                <div className="shape-a" style={{ left: -120, right: "auto" }}></div>
                <div
                  className="shape-b"
                  style={{ right: -170, left: "auto", background: "#7C3AED", opacity: 0.12 }}
                ></div>

                <svg
                  className="absolute inset-0 z-0 h-full w-full opacity-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid-catalogo-3"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                      ></path>
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#grid-catalogo-3)"
                  ></rect>
                </svg>

                <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
                  <div className="mb-8">
                    <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                      Catálogo de saídas
                    </h2>
                    <p className="text-sm text-gray-400">
                      Entregamos dados para sistemas internos e canais externos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {["ERP", "CRM", "Dashboards"].map((item) => (
                      <div key={item} className="catalog-card rounded-2xl p-6">
                        <h3 className="font-montserrat text-lg font-bold text-white">
                          {item}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">
                          Integrações seguras com governança total.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ),
          },
        ],
      },
      {
        id: "mapa",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <div
              className="shape-a"
              style={{ right: -60, top: -100, opacity: 0.2, filter: "blur(50px)" }}
            ></div>
            <div
              className="shape-b"
              style={{ left: -60, bottom: -60, opacity: 0.1, background: "#7C3AED", filter: "blur(60px)" }}
            ></div>

            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-mapa"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-mapa)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="mb-8">
                <h2 className="font-montserrat text-2xl font-bold text-white sm:text-3xl">
                  Quanto custa integrar?{" "}
                  <span className="font-light text-[#A78BFA]">
                    O mapa da complexidade
                  </span>
                </h2>
                <p className="text-sm text-gray-400">
                  A regra de ouro: o que encarece não é a automação, mas a
                  restrição do sistema legado.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <div className="mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-download text-[#10B981]"></i>
                    <h3 className="font-montserrat text-sm font-bold uppercase tracking-wide text-white">
                      Destino (Inserção de Dados)
                    </h3>
                  </div>

                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>Tipo de Integração</th>
                        <th style={{ width: "25%" }}>Complexidade</th>
                        <th style={{ width: "35%", textAlign: "right" }}>Estimativa (horas)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {integrationRows.map((row) => (
                        <tr key={row.label}>
                          <td>{row.label}</td>
                          <td>
                            <span className={`badge ${row.levelClass}`}>
                              {row.level}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>{estimateHoursLabel(row.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-5">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-upload text-[#A78BFA]"></i>
                      <h3 className="font-montserrat text-sm font-bold uppercase tracking-wide text-white">
                        Entrada (Captura)
                      </h3>
                    </div>

                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Entrada</th>
                          <th>Nível</th>
                          <th style={{ textAlign: "right" }}>Estimativa (horas)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {captureRows.map((row) => (
                          <tr key={row.label}>
                            <td>{row.label}</td>
                            <td>
                              <span className={`badge ${row.levelClass}`}>
                                {row.level}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>{estimateHoursLabel(row.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-[#7C3AED] bg-gradient-to-br from-[#4C1D95]/40 to-[#2B0A3D]/60 p-5">
                    <div className="absolute right-0 top-0 p-3 opacity-10">
                      <i className="fa-solid fa-lightbulb text-6xl text-white"></i>
                    </div>
                    <h4 className="font-montserrat mb-3 flex items-center gap-2 text-lg font-bold text-[#FCD34D]">
                      <i className="fa-solid fa-gavel text-sm"></i> Como decidir
                      rápido?
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <i className="fa-solid fa-check-circle mt-1 text-xs text-[#10B981]"></i>
                        <p className="m-0 text-sm text-gray-300">
                          <strong className="text-white">Tem API boa?</strong>
                          Quase sempre é o melhor caminho (e mais barato).
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fa-solid fa-check-circle mt-1 text-xs text-[#F59E0B]"></i>
                        <p className="m-0 text-sm text-gray-300">
                          <strong className="text-white">Sem API, mas tem CSV?</strong>
                          Caminho sólido, custo ok.
                        </p>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fa-solid fa-triangle-exclamation mt-1 text-xs text-[#EF4444]"></i>
                        <p className="m-0 text-sm text-gray-300">
                          <strong className="text-white">Não tem nada?</strong> Só
                          resta RPA (clicar na tela). É mais caro, frágil e exige
                          manutenção constante.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        id: "modulos-ia",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <div
              className="shape-a"
              style={{ top: -150, right: -100, width: 600, height: 600, opacity: 0.15, filter: "blur(80px)" }}
            ></div>
            <div
              className="shape-b"
              style={{ bottom: -100, left: -150, width: 500, height: 500, opacity: 0.1, background: "#7C3AED", filter: "blur(60px)" }}
            ></div>

            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-mod-ia"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-mod-ia)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                    Ingestão de PDF e IA
                  </h2>
                  <p className="text-sm text-gray-400">
                    Onde a automação geralmente "quebra". Tratamos layout
                    variável, scans e regras de negócio com módulos específicos.
                  </p>
                </div>
                <div className="flex w-fit items-center gap-2 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-1">
                  <i className="fa-solid fa-triangle-exclamation text-xs text-[#F59E0B]"></i>
                  <p className="m-0 text-xs font-extrabold uppercase text-[#F59E0B]">
                    Área de Risco do Projeto
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <table className="modules-table">
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>Módulo de Documento</th>
                        <th style={{ width: "20%" }}>Complexidade</th>
                        <th style={{ width: "35%", textAlign: "right" }}>Estimativa (horas)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentModules.map((row) => (
                        <tr key={row.title}>
                          <td>
                            <div className="flex items-center">
                              <div className={`icon-mini ${row.iconColor}`}>
                                <i className={`fa-solid ${row.iconClass} text-sm`}></i>
                              </div>
                              <div>
                                <p className="m-0 leading-tight">{row.title}</p>
                                <p className="m-0 mt-0.5 text-[11px] text-gray-400">
                                  {row.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`tag ${row.tagClass}`}>{row.tag}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>{estimateHoursLabel(row.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:col-span-4">
                  <div className="relative h-full overflow-hidden rounded-2xl border border-[#7C3AED] bg-[#2e1065] p-6">
                    <div className="absolute right-4 top-4 opacity-10">
                      <i className="fa-solid fa-scale-balanced text-6xl text-white"></i>
                    </div>
                    <h4 className="font-montserrat relative z-10 mb-6 flex items-center gap-2 text-lg font-bold text-[#FCD34D]">
                      <i className="fa-regular fa-lightbulb"></i> Regra Prática
                    </h4>

                    <div className="relative z-10 space-y-6">
                      {[
                        {
                          title: "Modelo Único",
                          text: "Layout fixo e padronizado é o cenário ideal e mais barato.",
                          color: "#10B981",
                        },
                        {
                          title: "Variações",
                          text: "Cada novo layout adiciona de +15% a +35% no custo do módulo.",
                          color: "#3B82F6",
                        },
                        {
                          title: "Caos (Vários Fornecedores)",
                          text: "Documentos sem padrão? Trate como projeto de IA + Revisão Humana Obrigatória.",
                          color: "#EF4444",
                        },
                      ].map((rule, index) => (
                        <div key={rule.title} className="flex items-start gap-4">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full border"
                            style={{ borderColor: `${rule.color}4d`, color: rule.color, background: `${rule.color}33` }}
                          >
                            <span className="text-sm font-extrabold">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-extrabold text-white">
                              {rule.title}
                            </p>
                            <p className="text-xs text-gray-400">{rule.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    *Os ranges são referência; refinamos após diagnóstico do seu
                    cenário.
                  </p>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        id: "enterprise",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <div
              className="shape-a"
              style={{ top: -150, right: -100, width: 600, height: 600, opacity: 0.15, filter: "blur(80px)" }}
            ></div>
            <div
              className="shape-b"
              style={{ bottom: -100, left: -150, width: 500, height: 500, opacity: 0.1, background: "#7C3AED", filter: "blur(60px)" }}
            ></div>

            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-enterprise"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-enterprise)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                    Módulos Enterprise
                  </h2>
                  <p className="text-sm text-gray-400">
                    Funcionalidades que garantem segurança, escala e conformidade
                    para operações de missão crítica.
                  </p>
                </div>
                <div className="flex w-fit items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1">
                  <i className="fa-solid fa-shield-halved text-xs text-[#3B82F6]"></i>
                  <p className="m-0 text-xs font-extrabold uppercase text-[#3B82F6]">
                    Aumenta o Ticket
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <table className="modules-table">
                    <thead>
                      <tr>
                        <th style={{ width: "45%" }}>Módulo Enterprise</th>
                        <th style={{ width: "20%" }}>Impacto</th>
                        <th style={{ width: "35%", textAlign: "right" }}>Estimativa (horas)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enterpriseModules.map((row) => (
                        <tr key={row.title}>
                          <td>
                            <div className="flex items-center">
                              <div className={`icon-mini ${row.iconColor}`}>
                                <i className={`fa-solid ${row.iconClass} text-sm`}></i>
                              </div>
                              <div>
                                <p className="m-0 leading-tight">{row.title}</p>
                                <p className="m-0 mt-0.5 text-[11px] text-gray-400">
                                  {row.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`tag ${row.tagClass}`}>{row.tag}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>{estimateHoursLabel(row.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:col-span-4">
                  <div className="relative h-full overflow-hidden rounded-2xl border border-[#7C3AED] bg-[#2e1065] p-6">
                    <div className="absolute right-4 top-4 opacity-10">
                      <i className="fa-solid fa-chess-rook text-6xl text-white"></i>
                    </div>

                    <h4 className="font-montserrat relative z-10 mb-6 flex items-center gap-2 text-lg font-bold text-[#A78BFA]">
                      <i className="fa-solid fa-gem"></i> Por que adicionar?
                    </h4>

                    <div className="relative z-10 space-y-6">
                      {[
                        {
                          title: "Proteção e Risco",
                          text: "Empresas grandes não compram sem SSO, Logs e LGPD. É o custo de entrada no mercado Enterprise.",
                          icon: "fa-lock",
                          color: "#60A5FA",
                        },
                        {
                          title: "Compliance e Auditoria",
                          text: "Quando o erro acontece, você precisa provar \"quem\", \"quando\" e \"o quê\".",
                          icon: "fa-check-double",
                          color: "#34D399",
                        },
                        {
                          title: "Escala Real",
                          text: "Filas e Retry garantem que a automação não pare mesmo se o sistema de destino cair.",
                          icon: "fa-rocket",
                          color: "#F59E0B",
                        },
                      ].map((item) => (
                        <div key={item.title} className="flex items-start gap-4">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full border"
                            style={{ borderColor: `${item.color}4d`, color: item.color, background: `${item.color}33` }}
                          >
                            <i className={`fa-solid ${item.icon} text-xs`}></i>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-extrabold text-white">
                              {item.title}
                            </p>
                            <p className="text-xs leading-relaxed text-gray-400">
                              {item.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    *Pacotes podem ser combinados conforme governança e risco.
                  </p>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        id: "preco",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <div
              className="shape-a"
              style={{ top: -100, right: -100, width: 520, height: 520, opacity: 0.2, filter: "blur(60px)" }}
            ></div>
            <div
              className="shape-b"
              style={{ bottom: -60, left: -60, width: 420, height: 420, opacity: 0.1, background: "#7C3AED", filter: "blur(50px)" }}
            ></div>

            <svg
              className="absolute inset-0 z-0 h-full w-full opacity-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-preco"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-preco)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
              <div className="mb-8">
                <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                  Como cobramos?{" "}
                  <span className="font-light text-[#A78BFA]">
                    Simples e transparente
                  </span>
                </h2>
                <p className="text-sm text-gray-400">
                  Estrutura dividida em Setup (construção do ativo) e Mensalidade
                  (sustentação e evolução).
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="glass-panel group relative rounded-xl border-t-4 border-t-[#3B82F6] p-6">
                  <div className="absolute right-4 top-4 text-5xl text-[#3B82F6] opacity-20 transition-opacity group-hover:opacity-40">
                    <i className="fa-solid fa-rocket"></i>
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B82F6]/20 text-[#3B82F6]">
                      <i className="fa-solid fa-hammer text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-montserrat text-xl font-bold text-white">
                        Setup do Projeto
                      </h3>
                      <p className="text-xs font-extrabold uppercase tracking-wide text-[#3B82F6]">
                        One-time (Pagamento Único)
                      </p>
                    </div>
                  </div>
                  <div className="mb-4 h-px w-full bg-white/10"></div>
                  <ul className="check-list">
                    <li>
                      <i className="fa-solid fa-check text-[#3B82F6]"></i>
                      <p className="m-0">
                        Diagnóstico aprofundado e desenho técnico
                      </p>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-[#3B82F6]"></i>
                      <p className="m-0">
                        Construção do fluxo e regras de negócio
                      </p>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-[#3B82F6]"></i>
                      <p className="m-0">
                        Integrações (API, Banco, SFTP, etc.)
                      </p>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-[#3B82F6]"></i>
                      <p className="m-0">Testes homologados e Deploy em produção</p>
                    </li>
                  </ul>
                  <div className="mt-5 text-xs text-gray-400">
                    Dica: o setup varia conforme <span className="text-white">integrações</span> + <span className="text-white">módulos (OCR/IA)</span> + <span className="text-white">governança</span>.
                  </div>
                </div>

                <div className="glass-panel group relative rounded-xl border-t-4 border-t-[#10B981] p-6">
                  <div className="absolute right-4 top-4 text-5xl text-[#10B981] opacity-20 transition-opacity group-hover:opacity-40">
                    <i className="fa-solid fa-arrows-rotate"></i>
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/20 text-[#10B981]">
                      <i className="fa-solid fa-heart-pulse text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-montserrat text-xl font-bold text-white">
                        Mensalidade
                      </h3>
                      <p className="text-xs font-extrabold uppercase tracking-wide text-[#10B981]">
                        Recorrente (Sustentação)
                      </p>
                    </div>
                  </div>
                  <div className="mb-4 h-px w-full bg-white/10"></div>
                  <ul className="check-list">
                    <li>
                      <i className="fa-solid fa-check text-[#10B981]"></i>
                      <p className="m-0">Monitoramento, alertas e operação assistida</p>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-[#10B981]"></i>
                      <p className="m-0">Manutenção e ajustes em regras e integrações</p>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-[#10B981]"></i>
                      <p className="m-0">Evoluções incrementais (novos layouts/campos)</p>
                    </li>
                    <li>
                      <i className="fa-solid fa-check text-[#10B981]"></i>
                      <p className="m-0">SLA e suporte conforme criticidade</p>
                    </li>
                  </ul>
                  <div className="mt-5 text-xs text-gray-400">
                    Mensalidade é dimensionada por <span className="text-white">volume</span>, <span className="text-white">criticidade</span> e <span className="text-white">módulos ativos</span>.
                  </div>
                </div>
              </div>

              <div className="glass-panel mt-10 rounded-2xl p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-montserrat text-xl font-bold text-white">
                      Fórmula (modelo mental)
                    </h3>
                    <p className="text-sm text-gray-400">
                      Uma forma rápida de entender do que o preço é composto.
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    *Valores finais após diagnóstico e escopo.
                  </div>
                </div>

                <div className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row">
                  {["Base Operacional", "Volume", "Módulos", "Integrações"].map(
                    (item, index) => (
                      <div key={item} className="flex flex-1 items-center">
                        <div className="formula-component w-full rounded-xl p-4">
                          <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-[#A78BFA]">
                            {item}
                          </p>
                          <p className="m-0 font-semibold text-white">
                            {item === "Base Operacional"
                              ? "Monitoramento + suporte"
                              : item === "Volume"
                                ? "Docs/mês + picos"
                                : item === "Módulos"
                                  ? "OCR / IA / HITL / Enterprise"
                                  : "API / Banco / RPA"}
                          </p>
                        </div>
                        {index < 3 && (
                          <div className="hidden w-8 items-center justify-center text-2xl font-extrabold text-[#A78BFA] lg:flex">
                            +
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <h3 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">
                      Quer um orçamento em 15 minutos?
                    </h3>
                    <p className="mt-2 text-gray-300">
                      Leve um exemplo de documento e o nome do sistema de destino.
                      A gente te diz o caminho mais barato (API/CSV/RPA) e o melhor
                      ROI.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 lg:col-span-4">
                    <ScheduleButton
                      onClick={() => setIsScheduleOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-3 font-semibold text-white transition hover:opacity-90"
                    >
                      <>
                        <i className="fa-solid fa-calendar-check"></i> Agendar
                        demonstração
                      </>
                    </ScheduleButton>
                    <WhatsAppButton
                      label="Falar no WhatsApp"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-gray-100 transition hover:bg-white/15"
                    />
                    <p className="text-center text-xs text-gray-500">
                      Resposta rápida • Sem compromisso
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        id: "faq",
        className: "relative overflow-hidden bg-[#2B0A3D]",
        content: (
          <>
            <svg className="absolute inset-0 z-0 h-full w-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-faq" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-faq)"></rect>
            </svg>

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
              <div className="text-center">
                <h2 className="font-montserrat text-2xl font-extrabold text-white sm:text-3xl">Dúvidas frequentes</h2>
                <p className="mt-3 text-sm text-gray-400">Respostas rápidas para facilitar sua decisão.</p>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    q: "Em quanto tempo conseguimos colocar no ar?",
                    a: "Projetos de menor complexidade entram em produção entre 3 e 6 semanas, com etapas semanais e validações junto ao time.",
                  },
                  {
                    q: "Funciona em celular e desktop?",
                    a: "Sim. O site foi modernizado com layout responsivo, rolagem suave e sessões clicáveis tanto no mobile quanto no PC.",
                  },
                  {
                    q: "Preciso ter API pronta?",
                    a: "Não necessariamente. Podemos operar com API, arquivos, banco e até estratégia híbrida conforme o cenário.",
                  },
                ].map((item) => (
                  <details key={item.q} className="faq-item rounded-xl p-5">
                    <summary className="cursor-pointer list-none font-semibold text-white">{item.q}</summary>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </>
        ),
      },


    ],
    []
  );

  useEffect(() => {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const sectionElements = navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) => link.classList.remove("active"));
            const active = links.find(
              (link) => link.getAttribute("href") === `#${entry.target.id}`
            );
            if (active) active.classList.add("active");
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleConfirmSchedule = () => {
    if (!selectedDate) return;
    const formatted = formatDate(selectedDate);
    const message = `Olá! Tenho interesse nas soluções de automação + IA da Atlas.Automate. Gostaria de agendar uma demonstração para ${formatted}. Podem me passar os próximos passos?`;
    window.open(buildWhatsappLink(message), "_blank");
    setIsScheduleOpen(false);
    setSelectedDate("");
  };

  return (
    <>
      <nav className="nav-glass fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            <a href="#hero" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED] text-white shadow-lg">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div className="font-montserrat text-lg font-bold tracking-wide text-white">
                Atlas<span className="text-[#7C3AED]">.Automate</span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-gray-200/80 hover:text-white md:hidden"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>

            <div className="hidden items-center gap-4 text-xs lg:text-sm md:flex">
              {navItems.map((item) => (
                <a key={item.href} className="nav-link" href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <ScheduleButton
                onClick={() => setIsScheduleOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#7C3AED] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <>
                  <i className="fa-solid fa-calendar-check"></i> Agendar demo
                </>
              </ScheduleButton>
              <WhatsAppButton
                label="WhatsApp"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-gray-100 transition hover:bg-white/15"
              />
            </div>
          </div>

          {isMenuOpen && (
            <div className="pb-4 md:hidden">
              <div className="flex flex-col gap-3 text-sm">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    className="nav-link"
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2">
                  <ScheduleButton
                    onClick={() => {
                      setIsScheduleOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="rounded-lg bg-[#7C3AED] px-4 py-2 font-semibold text-white"
                  >
                    <>
                      <i className="fa-solid fa-calendar-check mr-2"></i> Agendar
                      demonstração
                    </>
                  </ScheduleButton>
                  <WhatsAppButton
                    label="Falar no WhatsApp"
                    className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-gray-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="h-16"></div>

      <div className="section-rail fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex">
        <div className="section-rail-inner">
          {navItems.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = activeSectionId === id;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`rail-dot ${isActive ? "active" : ""}`}
                aria-label={`Ir para ${item.label}`}
                title={item.label}
              >
                <span className="rail-tooltip">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      <main>
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>

      <footer className="border-t border-white/10 bg-[#141414]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED] text-white shadow-lg">
                  <i className="fa-solid fa-brain"></i>
                </div>
                <div className="font-montserrat text-lg font-bold text-white">
                  Atlas<span className="text-[#7C3AED]">.Automate</span>
                </div>
              </div>
              <p className="max-w-xl text-sm text-gray-400">
                Automação + IA sob medida para reduzir custo operacional, aumentar
                rastreabilidade e escalar operações com segurança.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  className="text-gray-400 transition hover:text-white"
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a
                className="text-gray-500 transition-colors hover:text-white"
                href="#"
                aria-label="LinkedIn"
              >
                <i className="fa-brands fa-linkedin text-xl"></i>
              </a>
              <a
                className="text-gray-500 transition-colors hover:text-white"
                href="#"
                aria-label="Website"
              >
                <i className="fa-solid fa-globe text-xl"></i>
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
            <p className="text-xs text-gray-500">
              © 2026 Atlas.Automate. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-600">
              Este material não contém informações confidenciais por seção
              (landing version).
            </p>
          </div>
        </div>
      </footer>

      <ScheduleModal
        isOpen={isScheduleOpen}
        selectedDate={selectedDate}
        onClose={() => setIsScheduleOpen(false)}
        onDateChange={setSelectedDate}
        onConfirm={handleConfirmSchedule}
      />
    </>
  );
};

export default App;
