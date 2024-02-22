import { usb } from "../wailsjs/go/models";
import { For } from "solid-js";
import styles from "./Table.module.css";

function Table(props: {
  deviceList: usb.Device[];
  title: string;
  clickFn: (target: usb.Device | usb.Device[], name?: string) => void;
}) {
  const handle = (e: Event, data: usb.Device | usb.Device[]) => {
    e.preventDefault();
    console.log(data);

    if (Array.isArray(data)) {
      props.clickFn(data, props.title);
    } else {
      props.clickFn(data);
    }
  };
  return (
    <div class={styles["table-container"]}>
      <a
        href=";"
        class={styles["table-title"]}
        onClick={(e) => {
          handle(e, props.deviceList);
        }}
      >
        {props.title}
      </a>
      <div class={styles["table-outer"]}>
        <table class={styles.table}>
          <thead>
            <tr>
              <th>设备</th>
              <th>VID</th>
              <th>PID</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.deviceList}>
              {(item) => (
                <tr
                  onClick={(e) => {
                    handle(e, item);
                  }}
                >
                  <td>{item.name}</td>
                  <td>{item.vid}</td>
                  <td>{item.pid}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
