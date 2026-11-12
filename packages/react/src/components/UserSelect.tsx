import { forwardRef, useCallback } from "react";
import { X } from "lucide-react";
import { useUiLocale } from "../locale";
import SearchableMultiSelect from "./SearchableMultiSelect";
import UserChip from "./UserChip";
import type { UserSelectOption, UserSelectProps } from "./user-select";

export type { UserSelectOption, UserSelectProps };

function filterUserOption(option: UserSelectOption, query: string): boolean {
  return (
    option.name.toLowerCase().includes(query) ||
    (option.email ?? "").toLowerCase().includes(query)
  );
}

export const UserSelect = forwardRef<HTMLDivElement, UserSelectProps>(
  function MwUserSelect(
    {
      value,
      modelValue,
      defaultValue,
      onValueChange,
      onChange,
      users,
      placeholder,
      disabled = false,
      readonly,
      readOnly,
      invalid,
      required,
      inputId,
      name,
      ariaLabel,
      ariaLabelledby,
      ariaDescribedby,
      size,
      emptyMessage,
      ...rest
    },
    ref,
  ) {
    const { t } = useUiLocale();

    const placeholderText = placeholder ?? t("common.userSelect.placeholder");
    const emptyMessageText = emptyMessage ?? t("common.userSelect.empty");
    const isBlocked = Boolean(disabled || readonly || readOnly);

    const renderChip = useCallback(
      ({
        option,
        remove,
      }: {
        option: UserSelectOption;
        remove: () => void;
      }) => (
        <span className="mw-user-select__chip">
          <UserChip user={option} variant="tag" showCard={false} />
          <X
            className="mw-user-select__remove"
            aria-hidden="true"
            onMouseDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              if (!isBlocked) remove();
            }}
          />
        </span>
      ),
      [isBlocked],
    );

    const renderOption = useCallback(
      ({ option }: { option: UserSelectOption }) => (
        <span
          className="tw:flex tw:items-center tw:gap-2 tw:min-w-0"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            minWidth: 0,
          }}
        >
          <UserChip
            user={option}
            variant="avatar"
            showCard={false}
            className="tw:shrink-0"
            style={{ flexShrink: 0 }}
          />
          <span
            className="tw:truncate"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {option.name}
          </span>
          {option.email ? (
            <span
              className="tw:truncate tw:text-muted tw:text-xs"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--text-secondary)",
                fontSize: "var(--type-caption-size)",
              }}
            >
              {option.email}
            </span>
          ) : null}
        </span>
      ),
      [],
    );

    return (
      <SearchableMultiSelect<string, UserSelectOption>
        {...rest}
        ref={ref}
        value={value}
        modelValue={modelValue}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onChange={onChange}
        options={users}
        optionLabel="name"
        optionValue="id"
        optionFilter={filterUserOption}
        placeholder={placeholderText}
        disabled={disabled}
        readonly={readonly}
        readOnly={readOnly}
        invalid={invalid}
        required={required}
        inputId={inputId}
        name={name}
        ariaLabel={ariaLabel}
        ariaLabelledby={ariaLabelledby}
        ariaDescribedby={ariaDescribedby}
        size={size}
        emptyMessage={emptyMessageText}
        renderChip={renderChip}
        renderOption={renderOption}
      />
    );
  },
);

UserSelect.displayName = "MwUserSelect";

export default UserSelect;
