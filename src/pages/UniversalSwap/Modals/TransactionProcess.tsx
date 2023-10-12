import cn from 'classnames/bind';
import styles from './TransactionProcess.module.scss';
import { FC, useState } from 'react';

const cx = cn.bind(styles);

interface ModalProps {
  label?: string;
  content?: string;
  close?: () => void;
  onClick?: () => void;
  isPendding?: boolean;
}

export const TransactionProcess: FC<ModalProps> = ({
  label = 'Transactions made easy with one click',
  content = ' Bridge and universal swap all in one place. We’ll show you how to get started making an order. It takes less than 30 seconds.',
  close,
  onClick,
  isPendding
}) => {
  return (
    <div className={cx('process')}>
      <div className={cx('txs')}>
        <div className={cx('header')}>
          <div></div>
        </div>
        <div className={cx('section')}>
          <div className={cx('label')}>{label}</div>
          <div className={cx('content')}> {content}</div>
          <div className={cx('btn')}>
            {!isPendding && (
              <div className={cx('btn-take')} onClick={onClick}>
                Take quick tour
              </div>
            )}

            <div className={cx('btn-later')} onClick={close}>
              {isPendding ? 'Got it' : 'Later'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
