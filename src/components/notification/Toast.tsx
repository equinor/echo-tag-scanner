import { Snackbar, SnackbarProps } from '@equinor/eds-core-react';
import { useState } from 'react';
import styles from './styles.less';

interface ToastProps extends SnackbarProps {
  message: string;
  open: boolean;
  onClose?: () => void;
}

const Toast = (props: ToastProps): JSX.Element => {
  return (
    <Snackbar open={props.open} onClose={props.onClose} autoHideDuration={1000}>
      {props.message}
    </Snackbar>
  );
};

export { Toast };
