import { NextResponse } from 'next/server';

export function handleServerError(error: unknown) {
  console.error('Server Error:', error);
  
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    },
    { status: 500 }
  );
}
