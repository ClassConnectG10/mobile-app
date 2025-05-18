import React from "react";
import { View } from "react-native";
import { TextField } from "../forms/TextField";
import { AlertText } from "../AlertText";

interface SeatsFieldProps {
  seats: number;
  students: number;
  showAlert: boolean;
}

const PORCENTAGE_LIMIT = 0.1;
const REMAINING_SEATS_LIMIT = 5;

function getRemainingSeats(seats: number, students: number): number {
  if (seats === 0) return 0;
  if (students === 0) return seats;
  return seats - students;
}

function hasLimitedSeats(seats: number, students: number): boolean {
  const remaining = getRemainingSeats(seats, students);
  const limit = seats * PORCENTAGE_LIMIT;
  return (
    remaining > 0 && (remaining <= limit || remaining <= REMAINING_SEATS_LIMIT)
  );
}

export function hasNoSeats(seats: number, students: number): boolean {
  const remaining = getRemainingSeats(seats, students);
  return remaining <= 0;
}

export const SeatsField: React.FC<SeatsFieldProps> = ({
  seats,
  students,
  showAlert,
}) => {
  return (
    <View style={{ gap: 5 }}>
      <TextField
        label="Estudiantes inscriptos / Cupo máximo"
        value={`${students} / ${seats > 0 ? seats : "sin límite"}`}
      />

      {hasLimitedSeats(seats, students) && showAlert && (
        <AlertText text={"¡Últimos lugares disponibles!"} error={false} />
      )}

      {hasNoSeats(seats, students) && showAlert && (
        <AlertText text="No hay más lugares disponibles" error={true} />
      )}
    </View>
  );
};
