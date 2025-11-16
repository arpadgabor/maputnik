import React, { useState, useRef, useEffect, useCallback } from "react";
import Color from "color";
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import { type ColorResult } from "react-color";
import lodash from "lodash";

function formatColor(color: ColorResult): string {
  const rgb = color.rgb;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
}

export type InputColorProps = {
  onChange(...args: unknown[]): unknown;
  name?: string;
  value?: string;
  doc?: string;
  style?: object;
  default?: string;
  "aria-label"?: string;
};

export default function InputColor(props: InputColorProps) {
  const [pickerOpened, setPickerOpened] = useState(false);
  const colorInput = useRef<HTMLInputElement>(null);

  const [dirtyValue, setDirtyValue] = useState<string>(props.value || "rgb(255,255,255)");

  const onChangeNoCheck = useCallback(
    lodash.debounce((v: string) => {
      setDirtyValue(v);
      props.onChange(v);
    }, 500),
    [props.onChange]
  );
  const updateValue = useCallback(
    ((v: string) => {
      setDirtyValue(v);
      onChangeNoCheck(v);
    }),
    [onChangeNoCheck]
  );

  const calcPickerOffset = () => {
    const elem = colorInput.current;
    if (elem) {
      const pos = elem.getBoundingClientRect();
      return {
        top: pos.top - 4,
        left: pos.left + pos.width + 4,
      };
    } else {
      return {
        top: 160,
        left: 555,
      };
    }
  };

  const togglePicker = () => {
    setPickerOpened(!pickerOpened);
  };

  const getColor = () => {
    try {
      return Color(dirtyValue).rgb();
    } catch (err) {
      console.warn("Error parsing color: ", err);
      return Color("rgb(255,255,255)");
    }
  };

  const onChange = (v: string) => {
    props.onChange(v === "" ? undefined : v);
  };

  const offset = calcPickerOffset();
  const currentColor = getColor().object();
  const currentChromeColor = {
    r: currentColor.r,
    g: currentColor.g,
    b: currentColor.b,
    a: currentColor.alpha!,
  };

  const picker = (
    <div
      className="maputnik-color-picker-offset"
      style={{
        position: "fixed",
        zIndex: 1,
        left: offset.left,
        top: offset.top,
      }}
    >
      <ChromePicker
        color={currentChromeColor}
        onChange={c => updateValue(formatColor(c))}
      />
      <div
        className="maputnik-color-picker-offset"
        onClick={togglePicker}
        style={{
          zIndex: -1,
          position: "fixed",
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        }}
      />
    </div>
  );

  const swatchStyle = {
    backgroundColor: props.value,
  };

  return (
    <div className="maputnik-color-wrapper">
      {pickerOpened && picker}

      <div className="maputnik-color-swatch" style={swatchStyle}></div>

      <input
        aria-label={props["aria-label"]}
        spellCheck="false"
        autoComplete="off"
        className="maputnik-color"
        ref={colorInput}
        onClick={togglePicker}
        style={props.style}
        name={props.name}
        placeholder={props.default}
        value={props.value ? props.value : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
