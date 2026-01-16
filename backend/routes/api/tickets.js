const express = require('express');
const router = express.Router();
const { verifyOAuthToken, requireScope } = require('../../middleware/oauthVerify');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get ticket information (requires read:tickets scope)
router.get('/:ticketId', verifyOAuthToken, requireScope('read:tickets'), async (req, res) => {
  try {
    const { ticketId } = req.params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*, routes(*), bookings(*)')
      .eq('id', ticketId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      throw error;
    }

    // Log access
    await supabase.from('oauth_audit_log').insert({
      event_type: 'api_access',
      client_id: req.oauth.clientId,
      user_id: req.oauth.userId,
      details: { resource: 'ticket', action: 'read', ticket_id: ticketId }
    });

    res.json({ 
      ticket, 
      operator: req.oauth.operator?.operator_name 
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// Search tickets (requires read:tickets scope)
router.get('/', verifyOAuthToken, requireScope('read:tickets'), async (req, res) => {
  try {
    const { status, route_id, date, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('tickets')
      .select('*, routes(*)', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (route_id) {
      query = query.eq('route_id', route_id);
    }
    if (date) {
      query = query.eq('travel_date', date);
    }

    const { data: tickets, error, count } = await query;

    if (error) throw error;

    res.json({ 
      tickets, 
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Search tickets error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// Validate ticket (requires write:tickets scope)
router.post('/:ticketId/validate', verifyOAuthToken, requireScope('write:tickets'), async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Check if ticket exists and is valid
    const { data: existingTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchError || !existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (existingTicket.validated) {
      return res.status(400).json({ 
        error: 'already_validated',
        error_description: 'Ticket has already been validated',
        validated_at: existingTicket.validated_at
      });
    }

    // Validate the ticket
    const { data, error } = await supabase
      .from('tickets')
      .update({
        validated: true,
        validated_at: new Date().toISOString(),
        validated_by_operator: req.oauth.clientId
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;

    // Log validation
    await supabase.from('oauth_audit_log').insert({
      event_type: 'ticket_validated',
      client_id: req.oauth.clientId,
      user_id: req.oauth.userId,
      details: { ticket_id: ticketId }
    });

    res.json({ 
      success: true, 
      ticket: data,
      validated_by: req.oauth.operator?.operator_name
    });

  } catch (error) {
    console.error('Validate ticket error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
