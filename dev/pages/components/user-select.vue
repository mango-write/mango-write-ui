<script setup lang="ts">
import { ref } from "vue";
import { UserSelect, type UserSelectOption } from "../../../src";
import DocPage from "../../kit/DocPage.vue";
import DocSection from "../../kit/DocSection.vue";
import Specimen from "../../kit/Specimen.vue";
import StateGrid from "../../kit/StateGrid.vue";
import StateRow from "../../kit/StateRow.vue";

const members: UserSelectOption[] = [
  { id: "u-lin", name: "林知夏", email: "zhixia.lin@lab.edu.cn" },
  { id: "u-chen", name: "陈序", email: "xu.chen@lab.edu.cn" },
  { id: "u-zhou", name: "周予安", email: "yuan.zhou@lab.edu.cn" },
  { id: "u-su", name: "苏航", email: "hang.su@institute.org" },
  { id: "u-wang", name: "王书言", email: "shuyan.wang@institute.org" },
];

const reviewers = ref<string[]>(["u-lin", "u-chen"]);
const emptyUsers = ref<string[]>([]);
const allPicked = ref<string[]>(["u-lin", "u-chen", "u-zhou", "u-su"]);
</script>

<template>
  <DocPage lead="成员多选：基于 SearchableMultiSelect 与 UserChip 组合封装。已选成员以带头像的紧凑胶囊呈现，下拉面板同时展示头像、姓名与邮箱，支持按姓名或邮箱子串过滤。">
    <DocSection title="何时使用">
      <ul class="doc-rules">
        <li data-kind="do">在团队空间、草稿协作者、批注指派中选择一或多名成员。</li>
        <li data-kind="do">窄宽度下自动将放不下的成员胶囊折叠为 <code>+N</code>，保持单行高度稳定。</li>
        <li data-kind="dont">仅仅只读展示负责人或作者列表时，直接用 <code>UserChip</code>。</li>
      </ul>
    </DocSection>

    <DocSection title="底面" desc="纸面与霜面并排。内部复用 UserChip（关闭悬浮名片避免与下拉交互冲突），支持输入姓名或邮箱前缀直接筛选。">
      <Specimen :surfaces="['paper', 'frost']" layout="stack">
        <UserSelect
          v-model="reviewers"
          :users="members"
          placeholder="输入姓名或邮箱添加审稿协作者…"
        />
      </Specimen>
    </DocSection>

    <DocSection title="窄宽折叠" desc="在对话框侧栏或紧凑过滤条中，超出可用宽度的成员胶囊自动归并计数。">
      <Specimen themes="single" layout="stack">
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">窄容器 240px</span>
          <div style="width: 240px">
            <UserSelect v-model="allPicked" :users="members" />
          </div>
        </div>
        <div class="doc-row">
          <span class="doc-note" style="width: 88px">宽容器自适应</span>
          <div style="flex: 1; min-width: 280px">
            <UserSelect v-model="allPicked" :users="members" />
          </div>
        </div>
      </Specimen>
    </DocSection>

    <DocSection title="状态" desc="支持键盘上下选择、回车切换选中、Backspace 删除末尾成员。">
      <Specimen themes="both">
        <StateGrid :columns="['空态占位', '已选成员', '窄宽折叠', '禁用']" label-width="48px">
          <StateRow label="默认">
            <div style="width: 200px">
              <UserSelect v-model="emptyUsers" :users="members" placeholder="选择协作者…" />
            </div>
            <div style="width: 240px">
              <UserSelect v-model="reviewers" :users="members" />
            </div>
            <div style="width: 180px">
              <UserSelect v-model="allPicked" :users="members" />
            </div>
            <div style="width: 220px">
              <UserSelect v-model="reviewers" :users="members" disabled />
            </div>
          </StateRow>
        </StateGrid>
      </Specimen>
    </DocSection>

    <DocSection title="接口">
      <table class="doc-table">
        <thead>
          <tr><th>属性</th><th>取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>modelValue</code></td><td><code>string[]</code></td><td>选中的用户 ID 数组（<code>v-model</code>）</td></tr>
          <tr><td><code>users</code></td><td><code>UserSelectOption[]</code></td><td>候选成员列表（含 <code>id</code>、<code>name</code>、可选 <code>avatar</code> 与 <code>email</code>）</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>未选时的占位提示语</td></tr>
          <tr><td><code>emptyMessage</code></td><td><code>string</code></td><td>检索无匹配成员时的提示文案</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>禁用选择与移除操作</td></tr>
        </tbody>
      </table>
    </DocSection>
  </DocPage>
</template>
