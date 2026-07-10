import type { MDXComponents } from "mdx/types";
import CompareCard from "./CompareCard";
import PlanCard from "./PlanCard";
import ClaudeCodePlanCard from "./ClaudeCodePlanCard";
import ClaudeCodeCompareCard from "./ClaudeCodeCompareCard";
import StatuslineCompareCard from "./StatuslineCompareCard";
import SuperpowersSkillCard from "./SuperpowersSkillCard";
import SuperpowersFlowCard from "./SuperpowersFlowCard";
import OmcFeatureCard from "./OmcFeatureCard";
import OmcAgentCard from "./OmcAgentCard";
import OmcSuperpowersSynergyCard from "./OmcSuperpowersSynergyCard";
import TerminalToolCard from "./TerminalToolCard";
import ClaudeCodeCommandCard from "./ClaudeCodeCommandCard";
import ClaudeCodeShortcutCard from "./ClaudeCodeShortcutCard";
import GitCommandCard from "./GitCommandCard";
import StackSummaryCard from "./StackSummaryCard";
import DataTableCard from "./DataTableCard";
import KeybindCard from "./KeybindCard";
import DebugPhaseCard from "./DebugPhaseCard";
import FlowStepsCard from "./FlowStepsCard";

const components: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-12 mb-4 scroll-mt-24 font-display text-xl font-bold leading-snug tracking-tight text-text-primary"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-10 mb-3 scroll-mt-24 font-display text-lg font-semibold leading-snug text-text-primary"
      {...props}
    />
  ),
  p: (props) => (
    <p className="my-4 max-w-[65ch] leading-[1.8] text-text-secondary" {...props} />
  ),
  ul: (props) => (
    <ul className="my-4 list-disc pl-6 leading-[1.8] text-text-secondary" {...props} />
  ),
  ol: (props) => (
    <ol className="my-4 list-decimal pl-6 leading-[1.8] text-text-secondary" {...props} />
  ),
  li: (props) => <li className="my-1.5" {...props} />,
  a: (props) => (
    <a
      className="font-medium text-accent underline decoration-accent/30 underline-offset-2 spring-transition hover:decoration-accent"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-2 border-accent/30 pl-5 text-text-muted italic"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-2xl border border-border bg-card-bg p-5 text-sm shadow-ambient"
      {...props}
    />
  ),
  code: (props) => {
    const isInline = typeof props.children === "string";
    if (isInline) {
      return (
        <code
          className="rounded-md bg-tag-bg px-1.5 py-0.5 text-[0.875em] font-medium text-text-primary"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  CompareCard,
  PlanCard,
  ClaudeCodePlanCard,
  ClaudeCodeCompareCard,
  StatuslineCompareCard,
  SuperpowersSkillCard,
  SuperpowersFlowCard,
  OmcFeatureCard,
  OmcAgentCard,
  OmcSuperpowersSynergyCard,
  TerminalToolCard,
  ClaudeCodeCommandCard,
  ClaudeCodeShortcutCard,
  GitCommandCard,
  StackSummaryCard,
  DataTableCard,
  KeybindCard,
  DebugPhaseCard,
  FlowStepsCard,
};

export default components;
