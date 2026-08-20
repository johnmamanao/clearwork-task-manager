<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (Task::query()->exists()) {
            return;
        }

        $tasks = [
            ['title' => 'Prepare project demo', 'description' => 'Review the main workflow before presenting it.', 'status' => 'in_progress', 'priority' => 'high', 'due_date' => now()->addDays(2)],
            ['title' => 'Review API documentation', 'description' => 'Confirm every CRUD endpoint and example response.', 'status' => 'pending', 'priority' => 'medium', 'due_date' => now()->addDays(4)],
            ['title' => 'Run automated tests', 'description' => 'Verify the feature suite passes in a clean environment.', 'status' => 'completed', 'priority' => 'high', 'due_date' => now()],
            ['title' => 'Polish responsive layout', 'description' => 'Check the workspace at desktop and mobile sizes.', 'status' => 'completed', 'priority' => 'medium', 'due_date' => now()->subDay()],
            ['title' => 'Record walkthrough video', 'description' => 'Explain the architecture and one implementation detail.', 'status' => 'pending', 'priority' => 'high', 'due_date' => now()->addDays(5)],
            ['title' => 'Send assessment', 'description' => 'Share the repository, README, and screen recording.', 'status' => 'pending', 'priority' => 'low', 'due_date' => now()->addDays(6)],
        ];

        foreach ($tasks as $task) {
            Task::query()->create($task);
        }
    }
}
