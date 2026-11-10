import { computed } from "vue";
import { mpSim } from "./state";
import { t } from "../i18n";

export const demoText = computed(() => ({
  title: mpSim.longContent
    ? t({ zh: "对比 RAG 段落重排在长文档问答中的证据召回率与引文可靠性", en: "RAG Passage Reranking for Evidence Recall and Citation Reliability in Long-Document Question Answering" })
    : t({ zh: "长文档证据召回实验", en: "Long-document evidence recall" }),
  subtitle: mpSim.longContent
    ? t({ zh: "引入 ColBERTv2 延迟交互重排后，Top-5 证据召回率提升 6.4%；继续核验 DOI 10.48550/arXiv.2112.01488 与原始实验设置。", en: "ColBERTv2 late-interaction reranking improved Top-5 evidence recall by 6.4%; verify DOI 10.48550/arXiv.2112.01488 and the original experimental setup." })
    : t({ zh: "ColBERTv2 重排提升证据召回率 6.4%。", en: "ColBERTv2 reranking improved evidence recall by 6.4%." }),
  space: t({ zh: "我的个人空间", en: "Personal Space" }),
  journal: t({ zh: "科研日志", en: "Research Journal" }),
  library: t({ zh: "文献文库", en: "Library" }),
  assistant: t({ zh: "AI 助手", en: "AI Assistant" }),
}));
