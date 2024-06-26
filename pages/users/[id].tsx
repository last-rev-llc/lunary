import { Router, useRouter } from "next/router"

import { Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core"

import SmartViewer from "@/components/Blocks/SmartViewer"

import AgentSummary from "@/components/Blocks/Analytics/AgentSummary"
import UsageSummary from "@/components/Blocks/Analytics/UsageSummary"
import AppUserAvatar from "@/components/Blocks/AppUserAvatar"
import CopyText from "@/components/Blocks/CopyText"
import { useAppUser, useRuns, useRunsUsage } from "@/utils/dataHooks"
import { formatAppUser } from "@/utils/format"
import { NextSeo } from "next-seo"
import DataTable from "@/components/Blocks/DataTable"
import {
  costColumn,
  durationColumn,
  feedbackColumn,
  inputColumn,
  nameColumn,
  outputColumn,
  tagsColumn,
  timeColumn,
} from "@/utils/datatable"

const columns = [
  timeColumn("created_at"),
  nameColumn("Name"),
  durationColumn(),
  costColumn(),
  feedbackColumn(),
  tagsColumn(),
  inputColumn("Prompt"),
  outputColumn("Result"),
]

export default function UserDetails({}) {
  const router = useRouter()
  const { id } = router.query

  const { user } = useAppUser(id as string)

  const { runs, loading, validating, loadMore } = useRuns(undefined, {
    match: { user: id }, //, parent_run: undefined },
    filter: ["parent_run", "is", "null"],
  })

  const { usage } = id ? useRunsUsage(90, id) : {}

  const { name, email, ...extraProps } = user?.props || {}

  return (
    <Stack>
      <NextSeo title={formatAppUser(user)} />

      <Card withBorder>
        <Group gap={48}>
          <Group>
            <AppUserAvatar user={user} />
            <Title order={4}>{formatAppUser(user)}</Title>
          </Group>
          <Group gap={3}>
            <Text>ID:</Text>
            <CopyText value={user?.external_id} />
          </Group>
          {email && (
            <Group gap={3}>
              <Text>Email:</Text>
              <CopyText value={email} />
            </Group>
          )}
          <Group>
            <Text c="dimmed">{`last seen:  ${new Date(
              user?.last_seen,
            ).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}`}</Text>
          </Group>

          {Object.keys(extraProps).length > 0 && (
            <SmartViewer data={extraProps} />
          )}
        </Group>
      </Card>
      <Title order={2}>Analytics</Title>
      {usage && (
        <SimpleGrid cols={3} spacing="md">
          <UsageSummary usage={usage} />
          <AgentSummary usage={usage} />
        </SimpleGrid>
      )}

      <Title order={2}>Latest Activity</Title>

      <DataTable
        type="user-details"
        data={runs}
        columns={columns}
        loading={loading || validating}
        loadMore={loadMore}
        onRowClicked={(row) => {
          router.push(`/traces/${row.id}`)
        }}
      />
    </Stack>
  )
}
