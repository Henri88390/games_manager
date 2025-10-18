import React from "react";
import styles from "./Toast.module.scss";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error";
}

const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  type = "success",
}) => {
  if (!visible) return null;

  const toastClass = type === "error" ? styles.toastError : styles.toastSuccess;

  return <div className={`${styles.toast} ${toastClass}`}>{message}</div>;
};

export default Toast;
