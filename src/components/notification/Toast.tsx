import React from 'react';
import { Snackbar, SnackbarProps } from '@equinor/eds-core-react';

interface ToastProps extends SnackbarProps {
  message: string;
  open: boolean;
  onClose?: () => void;
  className?: string;
}

const Toast = (props: ToastProps): JSX.Element => {
  return (
    <Snackbar
      className={props.className}
      open={props.open}
      onClose={props.onClose}
      autoHideDuration={1000000}
    >
      {props.message}
    </Snackbar>
  );
};

export { Toast };
