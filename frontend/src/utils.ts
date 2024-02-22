import { usb } from "../wailsjs/go/models";

export function formatText(target: usb.Device | usb.Device[]) {
  let text = "";
  if (Array.isArray(target)) {
    const map = new Map();
    target.forEach((item) => {
      if (map.has(item.vid + item.pid)) return;
      map.set(item.vid + item.pid, item);
      text += formatText(item);
    });
  } else {
    text += `------------------------------------
设备信息：
  设备名称:  ${target.name}
  VendorID:  ${target.vid}
  ProductID:  ${target.pid} 
  制造商:  ${target.vendor}
  版本号:  ${target.version}
  类型:  ${target.class}
  子类型:  ${target.subclass}
  协议:  ${target.protocol}
------------------------------------

`;
  }
  return text;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
