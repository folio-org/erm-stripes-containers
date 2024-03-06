import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import { useHistory } from 'react-router-dom';
import createDecorator from 'final-form-focus';
import arrayMutators from 'final-form-arrays';
import { FormattedMessage, useIntl } from 'react-intl';
import { LastVisitedContext } from '@folio/stripes/core';
import { ConfirmationModal } from '@folio/stripes/components';

const focusOnErrors = createDecorator();

const useErmForm = ({ navigationCheck = true } = {}) => {
  const [openModal, setOpenModal] = useState(false);
  const [nextLocation, setNextLocation] = useState(null);

  const formSpyRef = useRef();

  const history = useHistory();
  const intl = useIntl();

  useEffect(() => {
    if (navigationCheck) {
      // Is this whole history.unblock a stale function? Maybe have the whole thing in state or ref?
      const unblock = history.block((nextLoc) => {
        // Due to stale closure probolems, grab current state from "state updator" pattern
        console.log("FORMSPYREF (FIRST): %o", formSpyRef);
        const shouldPrompt = !!formSpyRef.current && formSpyRef.current.dirty && !formSpyRef.current.submitSucceeded && !formSpyRef.current.submitting;
        console.log("FORMSPYREF: %o", formSpyRef);
        console.log("shouldPrompt: %o", shouldPrompt);

        if (shouldPrompt) {
          setOpenModal(true);
          setNextLocation(nextLoc);
        }

        return !shouldPrompt;
      });
      return unblock;
    }

    return () => {
    };
  }, [history, navigationCheck]);

  // const continueNavigation = (ctx) => {
  //   const { pathname, search } = nextLocation;

  //   ctx.cachePreviousUrl();
  //   setOpenModal(false);
  //   history.push(`${pathname}${search}`);
  // };

  const continueNavigation = useCallback((ctx) => {
    const { pathname, search } = nextLocation;

    ctx.cachePreviousUrl();
    setOpenModal(false);
    history.push(`${pathname}${search}`);
  }, [nextLocation, history]);

  const closeModal = () => {
    setOpenModal(false);
  };

  // useCallback applied to ERMForm
  const ERMForm = useCallback(({ FormComponent, initialValues, onSubmit, formOptions }) => {
    return (
      <LastVisitedContext.Consumer>
        {(ctx) => (
          <>
            <FinalForm
              {...formOptions}
              decorators={[focusOnErrors, ...(formOptions.decorators || [])]}
              initialValues={initialValues}
              mutators={{ ...formOptions.mutators, ...arrayMutators }}
              onSubmit={onSubmit}
              render={(formProps) => (
                <>
                  <FormComponent {...formProps} />
                  <FormSpy
                    onChange={state => {
                      formSpyRef.current = state;
                    }}
                    subscription={{
                      dirty: true,
                      submitSucceeded: true,
                      invalid: true,
                      submitting: true,
                    }}
                    {...formProps}
                  />
                </>
              )}
              subscription={{
                initialValues: true,
                submitting: true,
                pristine: true,
                ...formOptions.subscription,
              }}
            />
            <ConfirmationModal
              cancelLabel={<FormattedMessage id="stripes-erm-components.closeWithoutSaving" />}
              confirmLabel={<FormattedMessage id="stripes-erm-components.keepEditing" />}
              heading={intl.formatMessage({ id: 'stripes-erm-components.areYouSure' })}
              id="cancel-editing-confirmation"
              message={<FormattedMessage id="stripes-erm-components.unsavedChanges" />}
              onCancel={() => continueNavigation(ctx)}
              onConfirm={closeModal}
              open={openModal}
            />
          </>
        )}
      </LastVisitedContext.Consumer>
    );
  }, [intl, openModal, continueNavigation]);

  ERMForm.propTypes = {
    FormComponent: PropTypes.elementType.isRequired,
    initialValues: PropTypes.object,
    onSubmit: PropTypes.func,
    formOptions: PropTypes.shape({
      decorators: PropTypes.arrayOf(PropTypes.object),
      mutators: PropTypes.object,
      subscription: PropTypes.object,
    }),
  };

  return { ERMForm };
};

useErmForm.propTypes = {
  navigationCheck: PropTypes.bool,
};

export default useErmForm;