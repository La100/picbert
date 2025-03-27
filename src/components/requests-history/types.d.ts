// Deklaracje typów dla komponentów
declare module '@/components/ui/table' {
  export const Table: React.FC<React.ComponentProps<'table'>>;
  export const TableHeader: React.FC<React.ComponentProps<'thead'>>;
  export const TableBody: React.FC<React.ComponentProps<'tbody'>>;
  export const TableFooter: React.FC<React.ComponentProps<'tfoot'>>;
  export const TableHead: React.FC<React.ComponentProps<'th'>>;
  export const TableRow: React.FC<React.ComponentProps<'tr'>>;
  export const TableCell: React.FC<React.ComponentProps<'td'>>;
  export const TableCaption: React.FC<React.ComponentProps<'caption'>>;
}

declare module '@/components/EmptyState' {
  interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
  }
  const EmptyState: React.FC<EmptyStateProps>;
  export default EmptyState;
} 