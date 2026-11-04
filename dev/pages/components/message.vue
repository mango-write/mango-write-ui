<script setup lang="ts">
import { CheckCircle2, Info, ShieldAlert, Sparkles, TriangleAlert } from "lucide-vue-next";
import { ref } from "vue";
import { Button, Message } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const severities = [
  { label: "信息 info", value: "info", text: "正在后台同步文献元数据，解析完成后将自动更新引用锚点。" },
  { label: "成功 success", value: "success", text: "全文 PDF 解析完成，已提取 18 条图表与 42 处参考文献。" },
  { label: "警告 warning", value: "warning", text: "检测到 2 处引用未关联文库条目，导出前请核对来源。" },
  { label: "错误 error", value: "error", text: "DOI 解析服务连接超时，请检查网络或手动填写题录信息。" },
  { label: "次要 secondary", value: "secondary", text: "当前工作区处于只读历史快照视图，修改不会写回正文。" },
  { label: "反色 contrast", value: "contrast", text: "快捷键提示：按 ⌘K 可随时唤起全局文献与指令检索。" },
] as const;

const resetKey = ref(0);
</script>

<template>
  <DocPage lead="行内提示条（Message）：嵌入页面或表单流中的持久反馈橫幅，使用语义细边与柔和着色底，根据严重程度自动设置无障碍 role（status / alert）。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">在区块顶部或表单区域内展示与上下文紧密相关的提示、警告或阻断性错误说明。</li>
        <li data-kind="do">需要用户读完后收起非阻断提示时开启 <code>closable</code>。</li>
        <li data-kind="dont">操作完成后的短暂轻提示请用 <code>useNotify()</code>（Toast），不要在页面里闪现再消失一段 <code>Message</code>。</li>
        <li data-kind="dont">单个字段的校验报错直接挂在 <code>FormField</code> 的 <code>error</code> 属性上，不单独放一整条 <code>Message</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。语义细边（--*-border）与着色底（--*-subtle）在两类底面上都保持清晰层次。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <Message severity="info" :icon="Info">
          文献全文仅在当前团队空间内按法务档位共享，原始字节严格按用户隔离。
        </Message>
        <Message severity="warning" :icon="TriangleAlert" closable>
          当前草稿包含未处理的修订提案，导出 Word 前建议先确认或拒绝。
        </Message>
      </Specimen>
    </DocSection>

    <DocSection title="变体" desc="六种语义等级：info / success / warning (warn) / error / secondary / contrast。error 与 warn 自动声明 role='alert'。">
      <Specimen themes="single" layout="stack">
        <Message v-for="s in severities" :key="s.value" :severity="s.value" :icon="Sparkles">
          {{ s.text }}
        </Message>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="各语义等级在纯文本、带图标与可关闭（closable）状态下的对比。">
      <Specimen themes="both" layout="stack">
        <StateGrid :columns="['纯文本', '带图标', '可关闭 (closable)']" label-width="88px">
          <StateRow v-for="s in severities" :key="`${s.value}-${resetKey}`" :label="s.label.split(' ')[0]">
            <div style="width: 220px">
              <Message :severity="s.value">操作反馈或上下文说明文本。</Message>
            </div>
            <div style="width: 220px">
              <Message
                :severity="s.value"
                :icon="s.value === 'error' ? ShieldAlert : s.value === 'warning' ? TriangleAlert : s.value === 'success' ? CheckCircle2 : Info"
              >
                带前置图标的提示内容。
              </Message>
            </div>
            <div style="width: 240px">
              <Message :severity="s.value" :icon="Info" closable>
                可点击右侧按钮关闭此提示。
              </Message>
            </div>
          </StateRow>
        </StateGrid>
        <div class="doc-row">
          <Button size="xs" variant="text" severity="secondary" label="恢复已关闭的提示条" @click="resetKey++" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性 / 事件 / 插槽</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>severity</code></td><td><code>info · success · warn · warning · error · secondary · contrast</code></td><td>语义等级；默认 <code>info</code></td></tr>
          <tr><td><code>icon</code></td><td><code>Component</code></td><td>前置 Lucide 图标组件</td></tr>
          <tr><td><code>closable</code></td><td><code>boolean</code></td><td>是否显示右上角关闭按钮；默认 <code>false</code></td></tr>
          <tr><td><code>@close</code></td><td><code>(event: MouseEvent) =&gt; void</code></td><td>点击关闭按钮隐藏提示条时触发</td></tr>
          <tr><td><code>#default</code> / <code>#icon</code></td><td>—</td><td>提示正文内容与自定义前置图标插槽</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
