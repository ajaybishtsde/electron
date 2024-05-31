
import * as React from 'react';
import Component from '../../Component';
import ColorSwatch from './ColorSwatch';
import * as Colors from '@material-ui/core/colors';
import { FormLabel, FormControl, InputLabel } from '@material-ui/core';
import { FormControlProps } from '@material-ui/core/FormControl';
import $C from 'classnames';

interface Props {
    label?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    colors?: Array<string>;
    onChange?: (newValue: string) => void;
    value?: string;
}

import styles from './styles.css';
/* tslint:disable jsx-no-lambda */
export const ColorSwatchPicker: React.SFC<Props & FormControlProps> = (props: Props & FormControlProps) => {
    const {
        id,
        label,
        className,
        colors,
        onChange,
        value
    } = props;
    return (
        <FormControl className={$C(styles.root, label && styles.hasLabel, className)}>
            {label ? (
                <InputLabel htmlFor={id} className={styles.label} shrink>
                    {label}
                </InputLabel>
            ) : null}
            <div className={styles.wrapper}>
                {colors.map((color, idx) => {
                    return (
                        <ColorSwatch
                            key={color}
                            selected={color === value}
                            color={color}
                            onClick={(evt) => {
                                if (onChange) {
                                    onChange(color);
                                }
                            }}
                        />
                    );
                })}
            </div>
        </FormControl>
    );
};

export default ColorSwatchPicker;
