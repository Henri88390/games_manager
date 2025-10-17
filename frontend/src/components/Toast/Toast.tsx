import React from "react";
import styles from "./Toast.module.scss";

interface ToastProps {
  message: string;
  visible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  if (!visible) return null;
  return <div className={styles.toast}>{message}</div>;
};

export default Toast;
