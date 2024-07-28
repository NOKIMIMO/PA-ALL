interface Event {
    id: number;
    title: string;
    description: string;
    data_access_type?: string;
    event_date: string;
    location: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
    active: boolean;
  }