import { v4 as uuidv4 } from 'uuid';
import { addToast as add, removeToast } from '../store/toastSlice';
import { useDispatch } from 'react-redux';

const useToast = () => {
  const dispatch = useDispatch();

  const deleteToast = (id) => {
    // const filteredToasts = toasts.current.filter((toast) => {
    //   return toast.id != id;
    // });

    // toasts.current = filteredToasts;
    // setToastRerender((prev) => !prev);
    dispatch(removeToast(id));
  };

  const addToast = (toast) => {
    const id = uuidv4();
    const toastWithId = {
      ...toast,
      id,
    };

    dispatch(add(toastWithId));
    // toasts.current = [...toasts.current, toastWithId];
    // setToastRerender((prev) => !prev);

    setTimeout(() => {
      deleteToast(id);
    }, 5000);
  };

  return { addToast, deleteToast };
};

export default useToast;
