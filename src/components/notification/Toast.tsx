import React from 'react';
import { Snackbar, SnackbarProps } from '@equinor/eds-core-react';

interface ToastProps extends SnackbarProps {
  message: string;
  open: boolean;
  onClose?: () => void;
  className?: string;
  autoHideDuration?: number;
}

const Toast = (props: ToastProps): JSX.Element => {
  return (
    <Snackbar
      className={props.className}
      open={props.open}
      onClose={props.onClose}
      autoHideDuration={props.autoHideDuration ?? 1000}
    >
      {props.message}
    </Snackbar>
  );
};

export { Toast };
