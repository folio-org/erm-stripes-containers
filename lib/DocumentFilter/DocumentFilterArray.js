import PropTypes from 'prop-types';
import { useState } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Dropdown,
  DropdownMenu,
  MultiSelection,
  Select,
  Button,
  Label,
  IconButton,
  Row,
  Col,
} from '@folio/stripes/components';

const DocumentFilterArray = ({ translatedContentOptions, handleSubmit, name }) => {
  const [open, setOpen] = useState(false);
  const { values } = useFormState();
  const { change } = useForm();

  const intl = useIntl();

  return (
    <FieldArray name={name}>
      {({ fields }) => (
        <>
          {fields?.map((filter, index) => {
            return (
              <div key={index}>
                {values?.[name][index]?.grouping === '&&' && (
                  <Label>
                    <FormattedMessage id="stripes-erm-components.AND" />
                  </Label>
                )}
                {values?.[name][index]?.grouping === '||' && (
                  <Label>
                    <FormattedMessage id="stripes-erm-components.OR" />
                  </Label>
                )}
                <Row xs="end">
                  <Col xs={10}>
                    <Field
                      component={Select}
                      dataOptions={[
                        { value: '', label: '' },
                        {
                          value: ' isNotEmpty', // The space is part of the comparator
                          label: intl.formatMessage({
                            id: 'stripes-erm-components.documentFilter.has',
                          }),
                        },
                        {
                          value: ' isEmpty', // The space is part of the comparator
                          label: intl.formatMessage({
                            id: 'stripes-erm-components.documentFilter.hasNot',
                          }),
                        },
                      ]}
                      id={`${filter}-attribute-select`}
                      name={`${filter}.attribute`}
                      onChange={(e) => {
                        change(`${filter}.attribute`, e?.target?.value);
                        handleSubmit();
                      }}
                    />
                    <Field
                      key={values[name][index]?.content}
                      component={MultiSelection}
                      dataOptions={translatedContentOptions}
                      id={`${filter}-content-multi-select`}
                      name={`${filter}.content`}
                      onChange={(e) => {
                        change(`${filter}.content`, e);
                        handleSubmit();
                      }}
                    />
                  </Col>
                  {index !== 0 && (
                    <Col>
                      <IconButton
                        icon="times-circle-solid"
                        onClick={(e) => {
                          e.stopPropagation();
                          fields.remove(index);
                          handleSubmit();
                        }}
                      />
                    </Col>
                  )}
                </Row>
              </div>
            );
          })}
          <Dropdown
            label={
              <FormattedMessage id="stripes-erm-components.documentFilter.addFilter" />
            }
            onToggle={() => setOpen(!open)}
            open={open}
          >
            <DropdownMenu>
              <Button
                buttonStyle="dropdownItem"
                onClick={() => {
                  fields.push({ grouping: '&&' });
                  setOpen(false);
                }}
              >
                <FormattedMessage id="stripes-erm-components.AND" />
              </Button>
              <Button
                buttonStyle="dropdownItem"
                onClick={() => {
                  fields.push({ grouping: '||' });
                  setOpen(false);
                }}
              >
                <FormattedMessage id="stripes-erm-components.OR" />
              </Button>
            </DropdownMenu>
          </Dropdown>
        </>
      )}
    </FieldArray>
  );
};

DocumentFilterArray.propTypes = {
  translatedContentOptions: PropTypes.arrayOf(PropTypes.object),
  handleSubmit: PropTypes.func,
  name: PropTypes.string,
};

export default DocumentFilterArray;
