import { FormattedMessage } from 'react-intl';
import ky from 'ky';
import queryString from 'query-string';
import { useInfiniteQuery } from 'react-query';
import { useState } from 'react';

import { Button, LoadingPane, Modal, MultiColumnList, Pane, Paneset } from '@folio/stripes/components';

import SearchAndFilter from './components/SearchAndFilter';
import css from './index.css';

const PER_PAGE = 60;

const recordToReshareForm = rec => {
  if (typeof rec !== 'object') return null;
  const res = {
    systemInstanceIdentifier: rec.id,
    title: rec.title,
    author: ((typeof rec?.authors?.primary === 'object' ? Object.keys(rec.authors.primary).join('; ') : '')
              ?? (typeof rec?.authors?.corporate === 'object' ? Object.keys(rec.authors.corporate).join('; ') : '')),
    edition: rec?.edition,
    isbn: rec?.cleanIsbn,
    issn: rec?.cleanIssn,
    oclcNumber: rec?.cleanOclcNumber,
    publisher: rec?.publishers?.join('; '),
    publicationDate: rec?.publicationDates?.join('; '),
    placeOfPublication: rec?.placesOfPublication?.join('; '),
  };
  return res;
};

const PluginRsSIQueryVufind = ({ endpoint, selectInstance, searchButtonStyle, searchLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useState('');

  const query = useInfiniteQuery({
    queryKey: ['vufindLookup', searchParams],
    queryFn: ({ pageParam = 0 }) => ky(`${endpoint}/api/v1/search?${queryString.stringify({ ...searchParams, page: pageParam, limit: PER_PAGE }, { arrayFormat: 'bracket' })}`).json(),
    useErrorBoundary: true,
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: !!searchParams,
  });
  const results = query?.data?.pages?.flatMap(x => x?.records ?? []);
  const totalCount = query?.data?.pages?.[0]?.resultCount;

  const onSelect = record => {
    selectInstance(recordToReshareForm(record));
    setIsOpen(false);
  };

  return (
    <>
      <Button
        buttonStyle={searchButtonStyle}
        onClick={() => setIsOpen(true)}
      >
        {searchLabel}
      </Button>
      <Modal
        label={<FormattedMessage id="ui-plugin-rs-siquery-vufind.modal.title" />}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        closeOnBackgroundClick
        dismissible
        size="large"
        contentClass={css.pluginModalContent}
      >
        <Paneset isRoot>
          <Pane
            defaultWidth="20%"
            paneTitle={<FormattedMessage id="stripes-smart-components.searchAndFilter" />}
          >
            <SearchAndFilter setSearchParams={setSearchParams} />
          </Pane>
          {query.isSuccess &&
            <Pane
              defaultWidth="fill"
              noOverflow
              padContent={false}
              paneTitle={<FormattedMessage id="ui-plugin-rs-siquery-vufind.resultsHeader" />}
              paneSub={<FormattedMessage id="ui-rs.patronrequests.found" values={{ number: totalCount }} />}
            >
              <MultiColumnList
                autosize
                columnMapping={{
                  title: <FormattedMessage id="ui-plugin-rs-siquery-vufind.columns.title" />,
                  authors: <FormattedMessage id="ui-plugin-rs-siquery-vufind.columns.contributors" />,
                }}
                contentData={results}
                formatter={{
                  authors: v => (typeof v?.authors?.primary === 'object' ? Object.keys(v.authors.primary).join('; ') : ''),
                }}
                hasMargin
                loading={query?.isFetching}
                onNeedMoreData={(_ask, index) => query.fetchNextPage({ pageParam: Math.ceil(index / PER_PAGE) })}
                onRowClick={(_e, row) => onSelect(row)}
                pageAmount={PER_PAGE}
                totalCount={totalCount}
                virtualize
                visibleColumns={['title', 'authors']}
              />
            </Pane>
          }
          {query.isLoading &&
            <LoadingPane />
          }
        </Paneset>
      </Modal>
    </>
  );
};

export default PluginRsSIQueryVufind;
