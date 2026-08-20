<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeding_is_safe_to_run_more_than_once(): void
    {
        $this->seed();
        $this->seed();

        $this->assertDatabaseCount('tasks', 6);
    }

    public function test_it_lists_tasks_and_supports_filters(): void
    {
        Task::factory()->create(['title' => 'Ship release', 'status' => 'pending']);
        Task::factory()->create(['title' => 'Old task', 'status' => 'completed']);

        $this->getJson('/api/tasks?status=pending&search=Ship')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Ship release');
    }

    public function test_it_creates_a_task(): void
    {
        $payload = [
            'title' => 'Prepare demo',
            'description' => 'Record the walkthrough',
            'status' => 'pending',
            'priority' => 'high',
            'due_date' => '2026-08-21',
        ];

        $this->postJson('/api/tasks', $payload)
            ->assertCreated()
            ->assertJsonPath('data.title', 'Prepare demo');

        $this->assertDatabaseHas('tasks', ['title' => 'Prepare demo']);
    }

    public function test_it_validates_invalid_input(): void
    {
        $this->postJson('/api/tasks', [
            'title' => '',
            'status' => 'unknown',
            'priority' => 'urgent',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'status', 'priority']);
    }

    public function test_it_updates_a_task_partially(): void
    {
        $task = Task::factory()->create(['status' => 'pending']);

        $this->patchJson("/api/tasks/{$task->id}", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_it_deletes_a_task(): void
    {
        $task = Task::factory()->create();

        $this->deleteJson("/api/tasks/{$task->id}")->assertNoContent();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
