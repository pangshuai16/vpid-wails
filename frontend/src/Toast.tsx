import { createEffect, Show } from "solid-js";
import styles from "./Toast.module.css";

function Toast(props: { onClose: () => void; message: string }) {
  let toastTimer: number | null = null;

  createEffect(() => {
    if (props.message) {
      showMessage();
    }
  });

  function showMessage() {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      props.onClose();
    }, 1600);
  }
  return (
    <Show when={props.message}>
      <h5 class={`${styles.toast} ${styles.animated} ${styles.slideInUp}`}>
        {props.message}
      </h5>
    </Show>
  );
}

export default Toast;
