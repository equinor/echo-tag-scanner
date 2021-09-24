import { Snackbar, SnackbarProps } from '@equinor/eds-core-react';
import { useState } from 'react';

interface ToastProps extends SnackbarProps {
  message: string;
  open?: boolean;
}

const Toast = (props: ToastProps): JSX.Element => {
  const [open, setOpen] = useState(props.open ?? false);
  return (
    <Snackbar open={open} onClose={() => setOpen(false)} autoHideDuration={1000}>
      {props.message}
    </Snackbar>
  );
};

export { Toast };
