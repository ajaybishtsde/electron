
import * as React from 'react';
import Component from '../../Component';
import Check from '@material-ui/icons/Check';

interface Props extends React.Props<Props> {
    onClick?: (evt: React.MouseEvent<HTMLDivElement>) => void;
    selected?: boolean;
    color?: string;
}

import styles from './styles.css';
export const Swatch: React.SFC<Props> = ({ onClick, selected, color }: Props) => {
    return (
        <div className={styles.swatch} onClick={onClick}>
            <div className={styles.swatchWrapper} style={{ backgroundColor: color }}>
                {selected ? (
                    <Check className={styles.swatchCheck} />
                ) : null}
            </div>
        </div>
    );
};
export default Swatch;
