import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/expo';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Person = {
  id: string;
  name: string;
};

export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
};

export type ReceiptSplit = {
  id: string;
  itemId: string;
  personId: string;
  amount: number;
  paid: boolean;
};

export type Receipt = {
  id: string;
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  splits: ReceiptSplit[];
  imageUri?: string;
};

export type Debt = {
  id: string;
  personName: string;
  description: string;
  amount: number;
  date: string;
  paid: boolean;
  direction?: 'i_owe' | 'owed_to_me';
};

type LedgerData = {
  people: Person[];
  receipts: Receipt[];
  debts: Debt[];
};

type AddReceiptInput = {
  merchant: string;
  items: ReceiptItem[];
  splits: ReceiptSplit[];
  imageUri?: string;
};

type AddDebtInput = Omit<Debt, 'id' | 'date' | 'paid'>;
type AddOwedInput = Omit<Debt, 'id' | 'date' | 'paid' | 'direction'>;

type PersonSummary = {
  outstanding: number;
  settled: number;
  splits: Array<ReceiptSplit & { receipt: Receipt; item: ReceiptItem }>;
};

type LedgerContextValue = LedgerData & {
  ready: boolean;
  addPerson: (name: string) => Promise<Person | null>;
  addReceipt: (input: AddReceiptInput) => Promise<Receipt>;
  addDebt: (input: AddDebtInput) => Promise<Debt>;
  addOwed: (input: AddOwedInput) => Promise<Debt>;
  toggleSplitPaid: (receiptId: string, splitId: string) => Promise<void>;
  toggleDebtPaid: (debtId: string) => Promise<void>;
  getPersonSummary: (personId: string) => PersonSummary;
  totalOwedToMe: number;
  totalIOwe: number;
  outstandingPeople: number;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);
const EMPTY_DATA: LedgerData = { people: [], receipts: [], debts: [] };
const STORAGE_PREFIX = '@pocket-ledger/data/';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const [data, setData] = useState<LedgerData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    if (!isLoaded || !userId) {
      setData(EMPTY_DATA);
      setReady(isLoaded);
      return () => {
        cancelled = true;
      };
    }

    void AsyncStorage.getItem(`${STORAGE_PREFIX}${userId}`).then((stored) => {
      if (cancelled) return;
      if (stored) {
        try {
          setData(JSON.parse(stored) as LedgerData);
        } catch {
          setData(EMPTY_DATA);
        }
      } else {
        setData(EMPTY_DATA);
      }
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

  const persist = useCallback(
    async (next: LedgerData) => {
      setData(next);
      if (userId) {
        await AsyncStorage.setItem(
          `${STORAGE_PREFIX}${userId}`,
          JSON.stringify(next),
        );
      }
    },
    [userId],
  );

  const addPerson = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const person: Person = { id: makeId('person'), name: trimmed };
      await persist({ ...data, people: [...data.people, person] });
      return person;
    },
    [data, persist],
  );

  const addReceipt = useCallback(
    async (input: AddReceiptInput) => {
      const receipt: Receipt = {
        id: makeId('receipt'),
        merchant: input.merchant.trim() || 'Untitled receipt',
        date: new Date().toISOString(),
        total: roundMoney(input.items.reduce((sum, item) => sum + item.price, 0)),
        items: input.items,
        splits: input.splits,
        imageUri: input.imageUri,
      };
      await persist({ ...data, receipts: [receipt, ...data.receipts] });
      return receipt;
    },
    [data, persist],
  );

  const addDebt = useCallback(
    async (input: AddDebtInput) => {
      const debt: Debt = {
        ...input,
        id: makeId('debt'),
        date: new Date().toISOString(),
        paid: false,
        direction: 'i_owe',
      };
      await persist({ ...data, debts: [debt, ...data.debts] });
      return debt;
    },
    [data, persist],
  );

  const addOwed = useCallback(
    async (input: AddOwedInput) => {
      const debt: Debt = {
        ...input,
        id: makeId('owed'),
        date: new Date().toISOString(),
        paid: false,
        direction: 'owed_to_me',
      };
      await persist({ ...data, debts: [debt, ...data.debts] });
      return debt;
    },
    [data, persist],
  );

  const toggleSplitPaid = useCallback(
    async (receiptId: string, splitId: string) => {
      const receipts = data.receipts.map((receipt) =>
        receipt.id !== receiptId
          ? receipt
          : {
              ...receipt,
              splits: receipt.splits.map((split) =>
                split.id === splitId ? { ...split, paid: !split.paid } : split,
              ),
            },
      );
      await persist({ ...data, receipts });
    },
    [data, persist],
  );

  const toggleDebtPaid = useCallback(
    async (debtId: string) => {
      await persist({
        ...data,
        debts: data.debts.map((debt) =>
          debt.id === debtId ? { ...debt, paid: !debt.paid } : debt,
        ),
      });
    },
    [data, persist],
  );

  const getPersonSummary = useCallback(
    (personId: string): PersonSummary => {
      const splits = data.receipts.flatMap((receipt) =>
        receipt.splits
          .filter((split) => split.personId === personId)
          .map((split) => ({
            ...split,
            receipt,
            item: receipt.items.find((item) => item.id === split.itemId) ?? {
              id: split.itemId,
              name: 'Item',
              price: split.amount,
            },
          })),
      );
      return {
        outstanding: roundMoney(
          splits
            .filter((split) => !split.paid)
            .reduce((sum, split) => sum + split.amount, 0),
        ),
        settled: roundMoney(
          splits
            .filter((split) => split.paid)
            .reduce((sum, split) => sum + split.amount, 0),
        ),
        splits,
      };
    },
    [data.receipts],
  );

  const totalOwedToMe = useMemo(
    () =>
      roundMoney(
        data.receipts.reduce(
          (sum, receipt) =>
            sum +
            receipt.splits
              .filter((split) => !split.paid)
              .reduce((itemSum, split) => itemSum + split.amount, 0),
          0,
        ) +
          data.debts
            .filter((debt) => debt.direction === 'owed_to_me' && !debt.paid)
            .reduce((sum, debt) => sum + debt.amount, 0),
      ),
    [data.debts, data.receipts],
  );

  const totalIOwe = useMemo(
    () =>
      roundMoney(
        data.debts
          .filter((debt) => debt.direction !== 'owed_to_me' && !debt.paid)
          .reduce((sum, debt) => sum + debt.amount, 0),
      ),
    [data.debts],
  );

  const outstandingPeople = useMemo(
    () =>
      data.people.filter((person) => getPersonSummary(person.id).outstanding > 0)
        .length +
      new Set(
        data.debts
          .filter((debt) => debt.direction === 'owed_to_me' && !debt.paid)
          .map((debt) => debt.personName.trim().toLowerCase()),
      ).size,
    [data.debts, data.people, getPersonSummary],
  );

  const value = useMemo(
    () => ({
      ...data,
      ready,
      addPerson,
      addReceipt,
      addDebt,
      addOwed,
      toggleSplitPaid,
      toggleDebtPaid,
      getPersonSummary,
      totalOwedToMe,
      totalIOwe,
      outstandingPeople,
    }),
    [
      addDebt,
      addOwed,
      addPerson,
      addReceipt,
      data,
      getPersonSummary,
      outstandingPeople,
      ready,
      toggleDebtPaid,
      toggleSplitPaid,
      totalIOwe,
      totalOwedToMe,
    ],
  );

  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
}

export function useLedger(): LedgerContextValue {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used inside LedgerProvider');
  }
  return context;
}

export function formatMoney(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}