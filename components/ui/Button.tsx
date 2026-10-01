import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
};

const SIZES: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: '',
    lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({ className, variant = 'primary', size = 'md', ...rest }, ref) => (
        <button
            ref={ref}
            className={clsx(
                variant === 'primary' && 'btn-primary',
                variant === 'ghost' && 'btn-ghost',
                variant === 'outline' && 'btn-outline',
            variant === 'danger' && 'btn-danger',
                SIZES[size],
                className
            )}
            {...rest}
        />
    )
);
Button.displayName = 'Button';
