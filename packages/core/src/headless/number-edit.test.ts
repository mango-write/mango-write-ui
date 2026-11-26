import { describe, expect, it } from "vitest";
import {
  clampNumberValue,
  countNumberDecimals,
  formatCommittedNumber,
  isAllowedNumberInputText,
  parseNumberRaw,
  reconcileNumberEdit,
  roundNumberToPrecision,
} from "./number-edit.js";

describe("number-edit headless", () => {
  it("在带千分位的大数字前部连续插入数字时实时重排逗号并锚定光标", () => {
    const step1 = reconcileNumberEdit({
      prevText: "2,000,000",
      rawText: "25,000,000",
      rawCaret: 2,
      inputType: "insertText",
    });
    expect(step1.text).toBe("25,000,000");
    expect(step1.caret).toBe(2);
    expect(step1.parsed).toEqual({ kind: "number", value: 25_000_000 });

    const step2 = reconcileNumberEdit({
      prevText: step1.text,
      rawText: "250,000,000",
      rawCaret: 3,
      inputType: "insertText",
    });
    expect(step2.text).toBe("250,000,000");
    expect(step2.caret).toBe(3);

    const step3 = reconcileNumberEdit({
      prevText: step2.text,
      rawText: "2500,000,000",
      rawCaret: 4,
      inputType: "insertText",
    });
    expect(step3.text).toBe("2,500,000,000");
    expect(step3.caret).toBe(5);
    expect(step3.text.slice(0, step3.caret)).toBe("2,500");
    expect(step3.parsed).toEqual({ kind: "number", value: 2_500_000_000 });
  });

  it("删除首位数字时不塌缩后续前导零，继续输入新首位即可原地替换", () => {
    const afterDelete = reconcileNumberEdit({
      prevText: "2,000,000",
      rawText: ",000,000",
      rawCaret: 0,
      inputType: "deleteContentBackward",
    });
    expect(afterDelete.text).toBe("000,000");
    expect(afterDelete.caret).toBe(0);
    expect(afterDelete.parsed).toEqual({ kind: "number", value: 0 });

    const afterInsert = reconcileNumberEdit({
      prevText: afterDelete.text,
      rawText: "5000,000",
      rawCaret: 1,
      inputType: "insertText",
    });
    expect(afterInsert.text).toBe("5,000,000");
    expect(afterInsert.caret).toBe(1);
    expect(afterInsert.parsed).toEqual({ kind: "number", value: 5_000_000 });
  });

  it("仅在折叠光标下跨逗号删除相邻数字；拖选逗号或前后缀删除不误伤数值", () => {
    // 折叠光标紧贴逗号按 Backspace / Delete
    const backspaced = reconcileNumberEdit({
      prevText: "12,345,678",
      prevSelectionStart: 3,
      prevSelectionEnd: 3,
      rawText: "12345,678",
      rawCaret: 2,
      inputType: "deleteContentBackward",
    });
    expect(backspaced.text).toBe("1,345,678");
    expect(backspaced.caret).toBe(1);
    expect(backspaced.parsed).toEqual({ kind: "number", value: 1_345_678 });

    const deletedForward = reconcileNumberEdit({
      prevText: "12,345,678",
      prevSelectionStart: 2,
      prevSelectionEnd: 2,
      rawText: "12345,678",
      rawCaret: 2,
      inputType: "deleteContentForward",
    });
    expect(deletedForward.text).toBe("1,245,678");
    expect(deletedForward.caret).toBe(3);

    // 拖选单个逗号 12[,]345 按 Backspace 或 Delete：保留全部数字 12,345
    const selectedCommaBack = reconcileNumberEdit({
      prevText: "12,345",
      prevSelectionStart: 2,
      prevSelectionEnd: 3,
      rawText: "12345",
      rawCaret: 2,
      inputType: "deleteContentBackward",
    });
    expect(selectedCommaBack.text).toBe("12,345");
    expect(selectedCommaBack.parsed).toEqual({ kind: "number", value: 12_345 });

    // 拖选后缀 12[ kg] 或前缀 [USD ]12 删除：数值 12 不丢失
    const selectedSuffix = reconcileNumberEdit({
      prevText: "12 kg",
      prevSelectionStart: 2,
      prevSelectionEnd: 5,
      rawText: "12",
      rawCaret: 2,
      inputType: "deleteContentBackward",
      options: { suffix: " kg" },
    });
    expect(selectedSuffix.text).toBe("12 kg");
    expect(selectedSuffix.parsed).toEqual({ kind: "number", value: 12 });

    const selectedPrefix = reconcileNumberEdit({
      prevText: "USD 12",
      prevSelectionStart: 0,
      prevSelectionEnd: 4,
      rawText: "12",
      rawCaret: 0,
      inputType: "deleteContentForward",
      options: { prefix: "USD " },
    });
    expect(selectedPrefix.text).toBe("USD 12");
    expect(selectedPrefix.parsed).toEqual({ kind: "number", value: 12 });
  });

  it("兼容 de-DE、fr-FR、en-IN、ar-EG 等区域分组与小数分隔符，避免千分位误当小数点", () => {
    const deFormatted = formatCommittedNumber(2000, { locale: "de-DE", maxFractionDigits: 0 });
    expect(deFormatted).toBe("2.000");
    expect(parseNumberRaw(deFormatted, { locale: "de-DE", maxFractionDigits: 0 })).toEqual({
      kind: "number",
      value: 2000,
    });

    const deEditLarge = reconcileNumberEdit({
      prevText: "2.000.000",
      prevSelectionStart: 0,
      prevSelectionEnd: 1,
      rawText: "3.000.000",
      rawCaret: 1,
      inputType: "insertText",
      options: { locale: "de-DE", maxFractionDigits: 0 },
    });
    expect(deEditLarge.text).toBe("3.000.000");
    expect(deEditLarge.parsed).toEqual({ kind: "number", value: 3_000_000 });

    const deDecimal = reconcileNumberEdit({
      prevText: "",
      rawText: "1,25",
      rawCaret: 4,
      inputType: "insertText",
      options: { locale: "de-DE", maxFractionDigits: 2 },
    });
    expect(deDecimal.text).toBe("1,25");
    expect(deDecimal.parsed).toEqual({ kind: "number", value: 1.25 });

    const frPaste = reconcileNumberEdit({
      prevText: "",
      rawText: "1 234,50",
      rawCaret: 8,
      inputType: "insertFromPaste",
      options: { locale: "fr-FR", maxFractionDigits: 2 },
    });
    expect(frPaste.parsed).toEqual({ kind: "number", value: 1234.5 });

    const inEdit = reconcileNumberEdit({
      prevText: "12,34,567",
      prevSelectionStart: 1,
      prevSelectionEnd: 1,
      rawText: "192,34,567",
      rawCaret: 2,
      inputType: "insertText",
      options: { locale: "en-IN" },
    });
    expect(inEdit.text).toBe("1,92,34,567");
    expect(inEdit.parsed).toEqual({ kind: "number", value: 19_234_567 });

    const arInitial = formatCommittedNumber(1234.5, { locale: "ar-EG" });
    const arEdit = reconcileNumberEdit({
      prevText: arInitial,
      prevSelectionStart: 1,
      prevSelectionEnd: 1,
      rawText: `${arInitial.slice(0, 1)}9${arInitial.slice(1)}`,
      rawCaret: 2,
      inputType: "insertText",
      options: { locale: "ar-EG" },
    });
    expect(arEdit.rejected).toBeUndefined();
    expect(arEdit.parsed).toEqual({ kind: "number", value: 19234.5 });
  });

  it("拦截非法粘贴与超安全整数输入，且支持中文全角小数点", () => {
    // 整数框粘贴小数 1.5、科学计数法 1e-7、混杂字母 12abc34 或纯字母 abc 时拒绝篡改原值
    for (const bad of ["1.5", "1e-7", "12abc34", "abc", "9007199254740993"]) {
      const res = reconcileNumberEdit({
        prevText: "2,000",
        prevSelectionStart: 0,
        prevSelectionEnd: 5,
        rawText: bad,
        rawCaret: bad.length,
        inputType: "insertFromPaste",
        options: { locale: "en-US", maxFractionDigits: 0 },
      });
      expect(res.rejected, `should reject "${bad}"`).toBe(true);
      expect(res.text).toBe("2,000");
      expect(res.parsed).toEqual({ kind: "number", value: 2000 });
    }

    // 小数模式下中文输入法提交 １２。３ 识别为 12.3
    const zhIme = reconcileNumberEdit({
      prevText: "",
      rawText: "１２。３",
      rawCaret: 4,
      inputType: "insertCompositionText",
      options: { locale: "en-US", maxFractionDigits: 2 },
    });
    expect(zhIme.rejected).toBeUndefined();
    expect(zhIme.text).toBe("12.3");
    expect(zhIme.parsed).toEqual({ kind: "number", value: 12.3 });

    expect(isAllowedNumberInputText(".", { maxFractionDigits: 0 })).toBe(false);
    expect(isAllowedNumberInputText("abc")).toBe(false);
  });

  it("保护负号左侧输入、含数字前后缀及负货币往返一致性", () => {
    // |-2,000,000 键入 5 -> 保持负号 -52,000,000 且光标落在 -5|2,000,000
    const negFront = reconcileNumberEdit({
      prevText: "-2,000,000",
      prevSelectionStart: 0,
      prevSelectionEnd: 0,
      rawText: "5-2,000,000",
      rawCaret: 1,
      inputType: "insertText",
      options: { locale: "en-US" },
    });
    expect(negFront.text).toBe("-52,000,000");
    expect(negFront.caret).toBe(2);
    expect(negFront.parsed).toEqual({ kind: "number", value: -52_000_000 });

    // 数字前后缀与全角前缀只剥离一次；在前缀内键入数字不污染前缀字符
    expect(
      parseNumberRaw(formatCommittedNumber(1234, { prefix: "1", locale: "en-US" }), {
        prefix: "1",
        locale: "en-US",
      }),
    ).toEqual({ kind: "number", value: 1234 });
    expect(
      parseNumberRaw(formatCommittedNumber(1232, { suffix: "2", locale: "en-US" }), {
        suffix: "2",
        locale: "en-US",
      }),
    ).toEqual({ kind: "number", value: 1232 });
    expect(
      parseNumberRaw(formatCommittedNumber(1234, { prefix: "１ ", locale: "en-US" }), {
        prefix: "１ ",
        locale: "en-US",
      }),
    ).toEqual({ kind: "number", value: 1234 });

    const insidePrefix = reconcileNumberEdit({
      prevText: "v2:12",
      prevSelectionStart: 1,
      prevSelectionEnd: 1,
      rawText: "v92:12",
      rawCaret: 2,
      inputType: "insertText",
      options: { prefix: "v2:", locale: "en-US" },
    });
    expect(insidePrefix.text).toBe("v2:912");
    expect(insidePrefix.caret).toBe(4);
    expect(insidePrefix.parsed).toEqual({ kind: "number", value: 912 });

    // 负货币格式往返与编辑态布局一致
    const negUsd = formatCommittedNumber(-1234.5, {
      mode: "currency",
      currency: "USD",
      locale: "en-US",
    });
    expect(negUsd).toBe("-$1,234.50");
    expect(
      parseNumberRaw(negUsd, { mode: "currency", currency: "USD", locale: "en-US" }),
    ).toEqual({ kind: "number", value: -1234.5 });

    const editedNegUsd = reconcileNumberEdit({
      prevText: negUsd,
      prevSelectionStart: 3,
      prevSelectionEnd: 3,
      rawText: "-$12,234.50",
      rawCaret: 4,
      inputType: "insertText",
      options: { mode: "currency", currency: "USD", locale: "en-US" },
    });
    expect(editedNegUsd.text).toBe("-$12,234.50");
    expect(editedNegUsd.parsed).toEqual({ kind: "number", value: -12234.5 });

    // 极小科学计数法与负数中点四舍五入对称
    expect(countNumberDecimals(1.25e-7)).toBe(9);
    expect(formatCommittedNumber(1.25e-7, { useGrouping: false })).toBe("0.000000125");
    expect(roundNumberToPrecision(-1.005, 2)).toBe(-1.01);
    expect(clampNumberValue(-0, -10, 10, 2)).toBe(0);
  });
});
