export interface PricingTableProps {
  title: string;
  content: string;
  id: string;
  t?: any;
}

export interface PlanProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  buttonAction: () => void;
  highlight?: boolean;
  icon?: string;
  free?: boolean;
}
