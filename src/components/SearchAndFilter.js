import { Button, Icon, SearchField } from '@folio/stripes/components';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

const SearchAndFilter = ({ setSearchParams }) => {
  const [query, setQuery] = useState('');
  const handleQuery = q => setQuery(q?.target?.value);
  const handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    setSearchParams({
      lookfor: encodeURIComponent(query),
      field: ['id', 'authors', 'title', 'cleanIsbn', 'cleanIssn', 'cleanOclcNumber', 'edition', 'placesOfPublication', 'publicationDates', 'publishers']
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <SearchField
        autoFocus
        name="query"
        onChange={handleQuery}
        onClear={() => setQuery('')}
        value={query}
      />
      <Button
        buttonStyle="primary"
        disabled={!query}
        fullWidth
        type="submit"
      >
        <FormattedMessage id="stripes-smart-components.search" />
      </Button>
      <Button
        buttonStyle="none"
        id="clickable-reset-all"
        fullWidth
        onClick={() => setQuery('')}
      >
        <Icon icon="times-circle-solid">
          <FormattedMessage id="stripes-smart-components.resetAll" />
        </Icon>
      </Button>
    </form>
  );
};
export default SearchAndFilter;
