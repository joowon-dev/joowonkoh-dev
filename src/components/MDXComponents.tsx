import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-10 mb-4 text-xl font-bold text-text-primary" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 mb-3 text-lg font-semibold text-text-primary" {...props} />
  ),
  p: (props) => (
    <p className="my-4 leading-7 text-text-secondary" {...props} />
  ),
  ul: (props) => (
    <ul className="my-4 list-disc pl-6 text-text-secondary" {...props} />
  ),
  ol: (props) => (
    <ol className="my-4 list-decimal pl-6 text-text-secondary" {...props} />
  ),
  li: (props) => <li className="my-1" {...props} />,
  a: (props) => (
    <a className="text-blue-400 underline hover:text-blue-300" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-2 border-border pl-4 text-text-muted italic"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg border border-border bg-card-bg p-4 text-sm"
      {...props}
    />
  ),
  code: (props) => {
    const isInline = typeof props.children === "string";
    if (isInline) {
      return (
        <code className="rounded bg-tag-bg px-1.5 py-0.5 text-sm text-text-primary" {...props} />
      );
    }
    return <code {...props} />;
  },
};

export default components;
