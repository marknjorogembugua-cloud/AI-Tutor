import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...r }, ref) => (
        <input ref={ref} className={clsx('input', className)} {...r} />
    )
);
Input.displayName = 'Input';
