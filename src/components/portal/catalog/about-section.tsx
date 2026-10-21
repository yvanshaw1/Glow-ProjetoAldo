import {
  CalendarCheckIcon,
  CarFrontIcon,
  ListChecksIcon,
  type LucideIcon,
} from "lucide-react";

// docs/catalogo/paginas-publicas.md, Institucional: what the system offers,
// with fixed texts that name no company data (RN028).

type Highlight = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const HIGHLIGHTS: Highlight[] = [
  {
    // UC06
    icon: CalendarCheckIcon,
    title: "Agendamento pelo site",
    text: "Escolha o serviço, o veículo, o dia e o horário disponível, sem precisar ligar.",
  },
  {
    // UC07, RN017
    icon: ListChecksIcon,
    title: "Acompanhamento",
    text: "Veja em Meus agendamentos a situação de cada serviço, do agendamento à conclusão.",
  },
  {
    // UC05
    icon: CarFrontIcon,
    title: "Seus veículos",
    text: "Cadastre os seus veículos uma vez e use-os em todos os agendamentos.",
  },
];

export function AboutSection() {
  return (
    <section
      aria-labelledby="home-about-title"
      className="mx-auto flex max-w-page flex-col gap-8 px-6 py-14 lg:px-8"
    >
      <div className="flex max-w-2xl flex-col gap-3">
        <h2 id="home-about-title" className="text-h3 font-bold md:text-h2">
          Sobre nós
        </h2>
        <p className="text-muted-foreground">
          Somos uma empresa de estética automotiva dedicada a deixar cada
          veículo limpo, protegido e bem cuidado, com atendimento por hora
          marcada.
        </p>
      </div>
      <ul className="grid gap-8 lg:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex flex-col gap-3 rounded-xl bg-background p-5 shadow-neu-md"
          >
            <Icon aria-hidden className="size-[26px]" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
