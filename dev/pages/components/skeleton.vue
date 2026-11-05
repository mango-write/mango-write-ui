<script setup lang="ts">
import { Skeleton } from "../../../src";
import { api } from "../../api/entries/skeleton";
import ApiTable from "../../kit/ApiTable.vue";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";
</script>

<template>
  <DocPage lead="骨架屏（Skeleton）：在数据尚未返回时以近似真实排版的几何色块预先占位，避免内容加载完成瞬间发生剧烈的版面跳动。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">文献列表、卡片详情或用户名片首次加载时，按真实字高与间距组合矩形和圆形骨架。</li>
        <li data-kind="do">骨架构件自动标记 <code>aria-hidden="true"</code>，应在最外层容器上声明加载状态（如 <code>aria-busy="true"</code>）。</li>
        <li data-kind="dont">极短操作（&lt; 200ms）不要闪现骨架屏；未知结构的弹窗提交等待请用按钮内置 <code>loading</code>。</li>
        <li data-kind="dont">不要把骨架画得比真实内容更密集，一般 2–3 行文本块足以传达结构。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。骨架底色取 --fill-default，柔光扫掠（wave）叠加同系半透明高光，在深浅主题与霜面上均自然融合。">
      <Specimen :surfaces="['paper', 'frost']">
        <div style="display: flex; align-items: flex-start; gap: 12px; width: 100%; max-width: 340px">
          <Skeleton shape="circle" size="40px" />
          <div style="flex: 1; display: grid; gap: 8px">
            <Skeleton width="45%" height="14px" />
            <Skeleton width="90%" height="12px" />
            <Skeleton width="70%" height="12px" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="形态与尺寸" desc="支持矩形（rectangle）与圆形（circle）；可通过 size 同时指定宽高，或分别传入 width / height / borderRadius。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row" style="gap: 16px">
          <Skeleton shape="circle" size="28px" />
          <Skeleton shape="circle" size="40px" />
          <Skeleton shape="rectangle" size="40px" border-radius="var(--radius-md)" />
          <Skeleton width="120px" height="28px" border-radius="var(--radius-full)" />
        </div>
        <div style="display: grid; gap: 8px; max-width: 480px">
          <Skeleton width="35%" height="18px" />
          <Skeleton width="100%" height="12px" />
          <Skeleton width="92%" height="12px" />
          <Skeleton width="64%" height="12px" />
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="柔光扫掠动画（wave）与静态占位（none）在各几何形态下的对比。开启系统「减少动态效果」时自动停用扫掠动画。">
      <Specimen themes="both">
        <StateGrid :columns="['文本行', '圆形头像', '胶囊标签', '缩略图块']" label-width="88px">
          <StateRow label="流光 wave">
            <div style="width: 140px; display: grid; gap: 6px">
              <Skeleton width="100%" height="12px" animation="wave" />
              <Skeleton width="70%" height="12px" animation="wave" />
            </div>
            <Skeleton shape="circle" size="36px" animation="wave" />
            <Skeleton width="84px" height="24px" border-radius="var(--radius-full)" animation="wave" />
            <Skeleton width="96px" height="52px" border-radius="var(--radius-md)" animation="wave" />
          </StateRow>
          <StateRow label="静态 none">
            <div style="width: 140px; display: grid; gap: 6px">
              <Skeleton width="100%" height="12px" animation="none" />
              <Skeleton width="70%" height="12px" animation="none" />
            </div>
            <Skeleton shape="circle" size="36px" animation="none" />
            <Skeleton width="84px" height="24px" border-radius="var(--radius-full)" animation="none" />
            <Skeleton width="96px" height="52px" border-radius="var(--radius-md)" animation="none" />
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <ApiTable :api="api" />
    </DocSection>
  </DocPage>
</template>
