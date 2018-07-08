import classNames from "classnames";
import React from "react";
import { withSpace } from "renderer/hocs/withSpace";
import {
  FilterOptionLink,
  FilterOptionIcon,
  FilterGroup,
} from "renderer/pages/common/SortsAndFilters";
import { Space } from "common/helpers/space";
import { LocalizedString } from "common/types";
import { T } from "renderer/t";

interface SortOptionsProps {
  sortBy: string;
  label: LocalizedString;
  space: Space;
}

export const SortOption = withSpace((props: SortOptionsProps) => {
  const { space, sortBy, label } = props;
  let active = space.queryParam("sortBy") === sortBy;
  let reverse = space.queryParam("sortDir") === "reverse";
  let href: string;
  if (!active) {
    href = space.urlWithParams({ sortBy, sortDir: "default" });
  } else {
    if (!reverse) {
      href = space.urlWithParams({ sortBy, sortDir: "reverse" });
    } else {
      href = space.urlWithParams({ sortBy: undefined, sortDir: undefined });
    }
  }

  return (
    <FilterOptionLink
      target="_replace"
      href={href}
      className={classNames({ active })}
    >
      <FilterOptionIcon
        className={classNames({ inactive: !active })}
        icon={active && reverse ? "sort-amount-desc" : "sort-amount-asc"}
      />
      {T(label)}
    </FilterOptionLink>
  );
});
