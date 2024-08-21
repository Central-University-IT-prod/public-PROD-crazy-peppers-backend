export type RawSortedTeam = {
  _id: { _id: string };
  matches: number;
  doc: {
    _id: string;
    tid: string;
    name: string;
    description: string;
    roles: {
      name: string;
      available: number;
    }[];
    total_members: number;
    tags: string[];
  };
};

export type RawSortedTeams = RawSortedTeam[];
