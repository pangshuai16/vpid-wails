import {
  createSignal,
  onMount,
  batch,
  createEffect,
  Show,
  onCleanup,
} from "solid-js";
import { usb } from "../wailsjs/go/models";
import { ClipboardSetText, Quit } from "../wailsjs/runtime";
import { formatText } from "./utils";
import Table from "./Table";
import Toast from "./Toast";
import "./App.css";
import { GetHidList, SetHidBase } from "../wailsjs/go/usb/USB";

function App() {
  const [currentList, setCurrentList] = createSignal<usb.Device[]>([]);
  const [addList, setAddList] = createSignal<usb.Device[]>([]);
  const [removeList, setRemoveList] = createSignal<usb.Device[]>([]);
  const [toastMsg, setToastMsg] = createSignal("");
  const [autoRefresh, setAutoRefresh] = createSignal(false);

  let timer: number;

  onMount(() => {
    getUsbList();
  });
  onCleanup(() => {
    if (timer) clearInterval(timer);
  });
  function showMessage(msg: string) {
    setToastMsg("");
    setToastMsg(msg);
  }

  function copyText(target: usb.Device[] | usb.Device, name?: string) {
    ClipboardSetText(formatText(target))
      .then(() => {
        if (Array.isArray(target)) {
          showMessage(`${name}，复制成功`);
        } else {
          showMessage(`${target.vid}:${target.pid} 复制成功`);
        }
      })
      .catch(() => {
        showMessage("复制失败");
      });
  }

  async function getUsbList() {
    const { currentList, addList, removeList } = await GetHidList();
    batch(() => {
      setCurrentList(currentList);
      setAddList(addList);
      setRemoveList(removeList);
    });
    console.log(currentList, addList, removeList);
  }

  function setHidBase() {
    SetHidBase().then(() => showMessage("当前列表已设为对比基准"));
  }

  createEffect(() => {
    if (autoRefresh()) {
      timer = setInterval(() => {
        getUsbList();
      }, 1000);
    } else {
      clearInterval(timer);
    }
  });
  return (
    <>
      <Toast onClose={() => setToastMsg("")} message={toastMsg()}></Toast>

      <div class="box">
        <Table
          deviceList={currentList()}
          title="当前设备"
          clickFn={copyText}
        ></Table>
      </div>
      <div class="box">
        <Table
          deviceList={addList()}
          title="新增设备"
          clickFn={copyText}
        ></Table>
        <Table
          deviceList={removeList()}
          title="移除设备"
          clickFn={copyText}
        ></Table>
      </div>
      <div class="box">
        <Show when={autoRefresh()}>
          <button
            class="btn"
            onclick={() => {
              setAutoRefresh(false);
            }}
          >
            停止刷新
          </button>
        </Show>
        <Show when={!autoRefresh()}>
          <button
            class="btn"
            onclick={() => {
              setAutoRefresh(true);
            }}
          >
            自动刷新
          </button>
          <button class="btn" onclick={getUsbList}>
            手动刷新
          </button>
        </Show>
        <button class="btn" onClick={setHidBase}>
          重设基准
        </button>
        <button class="btn" onClick={Quit}>
          退出
        </button>
      </div>
    </>
  );
}

export default App;
